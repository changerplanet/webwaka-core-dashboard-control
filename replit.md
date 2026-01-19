# WebWaka Core Dashboard Control

## Overview
This is a substrate module for the WebWaka Modular Ecosystem. It provides dashboard lifecycle and privilege-driven UI control specifications. The project is currently in the documentation/specification phase with implementation pending.

## Project Structure
- `public/` - Static HTML files served to the browser
- `server.py` - Simple Python HTTP server for static file serving
- `module.manifest.json` - Module metadata and configuration
- `module.contract.md` - Module contract specification
- `README.md` - Project documentation
- `CHANGELOG.md` - Version history
- `OWNERS.md` - Project ownership information
- `SECURITY.md` - Security policy

## Running the Project
The project runs a simple static file server on port 5000 using Python's built-in HTTP server.

```bash
python server.py
```

## Deployment
Static deployment from the `public/` directory.
