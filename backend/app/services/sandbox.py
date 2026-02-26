import subprocess
import tempfile
import os

def secure_run_python_code(code_string: str, timeout_seconds: int = 5) -> dict:
    """
    Takes user submitted Python code from Monaco Editor and executes it locally.
    In a real production environment, this should ideally run via a Docker container 
    or Judge0 to strictly sandbox filesystem access.
    """
    
    # We write the string out to a temporary file locally so the Python interpreter can execute it.
    with tempfile.NamedTemporaryFile(mode='w', suffix=".py", delete=False) as temp_script:
        temp_script.write(code_string)
        temp_filepath = temp_script.name
        
    try:
        # Run strict Python3 subprocess bounded by time execution constraints to prevent infinite loops (like `while True:`)
        process = subprocess.run(
            ["python3", temp_filepath],
            capture_output=True,
            text=True,
            timeout=timeout_seconds,
            check=False 
        )
        
        return {
            "status": "success" if process.returncode == 0 else "error",
            "stdout": process.stdout,
            "stderr": process.stderr,
            "execution_time_ms": 0 # Time metric to be added later
        }
        
    except subprocess.TimeoutExpired:
        return {
            "status": "error",
            "stdout": "",
            "stderr": f"Execution Timed Out: Max limit {timeout_seconds}s exceeded.",
        }
    except Exception as e:
         return {
            "status": "error",
            "stdout": "",
            "stderr": f"Sandbox System Error: {str(e)}",
        }
    finally:
        # Always clean up the temp execution script after the code sandbox exits
        if os.path.exists(temp_filepath):
            os.remove(temp_filepath)
