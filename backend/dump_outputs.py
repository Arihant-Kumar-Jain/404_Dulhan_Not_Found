import subprocess
import json

def run_it():
    demo = subprocess.run(["python", "demo_run.py"], capture_output=True, text=True, encoding="utf-8")
    tests = subprocess.run(["pytest", "tests/", "-v"], capture_output=True, text=True, encoding="utf-8")
    
    with open("final_output.log", "w", encoding="utf-8") as f:
        f.write("=== DEMO OUTPUT ===\n")
        f.write(demo.stdout)
        f.write("\n=== PYTEST OUTPUT ===\n")
        f.write(tests.stdout)

run_it()
