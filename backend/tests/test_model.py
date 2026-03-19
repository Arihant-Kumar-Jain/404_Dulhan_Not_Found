import pytest
import numpy as np

from backend.models.clip_xgboost.model import DecorNNRegressor
from backend.models.clip_xgboost.feature_extractor import build_metadata_vector


def test_build_metadata_vector():
    label = {
        "function": "reception",  # 5
        "style": "modern",        # 2
        "complexity": 4,          # 4
        "guest_range": "200-500", # 1
        "city": "mumbai",         # 2
        "is_outdoor": True,       # 1
        "has_floral_ceiling": False, # 0
        "has_led_backdrop": True, # 1
        "admin_extra": {
            "has_custom_stage": True,
            "drone_show": False
        }
    }
    
    # Passing a fixed extra_keys list ensures columns are stable
    extra_keys = ["drone_show", "has_custom_stage"]
    
    vec = build_metadata_vector(label, extra_keys)
    assert len(vec) == 8 + 2
    
    # Check fixed features
    assert vec[0] == 5.0  # function
    assert vec[1] == 2.0  # style
    assert vec[2] == 4.0  # complexity
    assert vec[3] == 1.0  # guest_range
    assert vec[4] == 2.0  # city_tier
    assert vec[5] == 1.0  # is_outdoor
    assert vec[6] == 0.0  # has_floral_ceiling
    assert vec[7] == 1.0  # has_led_backdrop
    
    # Check admin_extra dynamically sorted map
    assert vec[8] == 0.0  # drone_show
    assert vec[9] == 1.0  # has_custom_stage


def test_nn_regressor_training_and_saving(tmp_path):
    # Create fake data
    n_samples = 10
    n_features = 1033 + 2
    
    X = np.random.rand(n_samples, n_features).astype(np.float32)
    
    # Targets: strict ordering low < mid < high
    y = np.zeros((n_samples, 3), dtype=np.float32)
    y[:, 0] = np.random.randint(100_000, 200_000, n_samples)
    y[:, 1] = y[:, 0] + np.random.randint(50_000, 100_000, n_samples)
    y[:, 2] = y[:, 1] + np.random.randint(100_000, 200_000, n_samples)
    
    extra_keys = ["drone_show", "has_custom_stage"]
    
    # 1. Train model
    regressor = DecorNNRegressor(input_dim=n_features)
    # 2 epochs is enough just to test that the forward/backward pass doesn't crash
    regressor.train(X, y, extra_keys, epochs=2)
    
    # Override ARTIFACTS_DIR purely for this test

    import backend.config as config
    original_dir = config.settings.MODEL_ARTIFACTS_DIR
    config.settings.MODEL_ARTIFACTS_DIR = tmp_path
    
    try:
        # 2. Save
        regressor.save("test_nn.pt")
        assert (tmp_path / "test_nn.pt").exists()
        
        # 3. Load
        loaded = DecorNNRegressor.load("test_nn.pt")
        assert loaded.extra_keys == extra_keys
        assert loaded.input_dim == n_features
        
        # 4. Predict
        preds = loaded.predict(X)
        assert preds.shape == (n_samples, 3)
        
        # 5. Check logical ordering constraint (enforced by predict method)
        for i in range(n_samples):
            assert preds[i, 0] <= preds[i, 1] <= preds[i, 2]
    
    finally:
        config.settings.MODEL_ARTIFACTS_DIR = original_dir
