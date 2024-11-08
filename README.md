Here's a polished and enhanced version of your README.md file:

---

# AWS Scanner

Discover and scan AWS resources in your AWS account with ease!

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:
- Python 3.x
- Node.js and npm

### Setting Up the Project

#### Backend Setup

1. **Navigate to the backend directory**:
   ```sh
   cd backend
   ```

2. **Set up a Python virtual environment and install the requirements**:
   ```sh
   python -m venv venv
   source venv/bin/activate  # On Windows use: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Start the Python backend**:
   ```sh
   python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

#### Frontend Setup

1. **Open a separate terminal** and navigate to the frontend directory.

2. **Start the frontend**:
   ```sh
   npm run dev
   ```

### Usage

- Access the application via your browser at `http://localhost:8000`
- Follow the prompts to scan your AWS resources.

### Contributing

Feel free to fork this repository and submit pull requests. For major changes, please open an issue first to discuss what you would like to change.

### License

This project is licensed under the MIT License.

---

Does this look good to you? Let me know if you'd like any further tweaks!