import os
import subprocess
import time

MAX_FILES = 8  # Set the limit for the number of files

def run_python_files(folder_path):
    """Opens all Python files in VS Code and runs them in separate integrated terminals."""
    
    if not os.path.exists(folder_path):
        print(f"Folder '{folder_path}' does not exist.")
        return

    python_files = sorted([f for f in os.listdir(folder_path) if f.endswith('.py')])

    if not python_files:
        print("No Python files found in the folder.")
        return

    # Stop execution if more than MAX_FILES
    if len(python_files) > MAX_FILES:
        print(f"⚠️ Too many files! Found {len(python_files)}, but the limit is {MAX_FILES}. Exiting...")
        return

    # Open VS Code in the project folder (only one window)
    subprocess.Popen(["code", folder_path], shell=True)
    time.sleep(2)  # Give VS Code some time to launch

    for file in python_files:
        file_path = os.path.join(folder_path, file)
        print(f"Opening {file} in VS Code...")

        # Open each Python file in the same VS Code window
        subprocess.Popen(["code", "-g", file_path], shell=True)
        time.sleep(0.5)  # Small delay to prevent race conditions

        # Run script in a new terminal inside VS Code
        command = f'workbench.action.terminal.new && workbench.action.terminal.sendSequence {{ "text": "python {file_path}\\n" }}'
        subprocess.Popen(["code", "--execute-command", command], shell=True)

if __name__ == "__main__":
    folder = r"C:\Users\priya\DocAssist\backend"  # Set your folder path
    run_python_files(folder)
