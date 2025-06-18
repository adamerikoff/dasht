#!/bin/bash

# Define the path to your main.go file
MAIN_GO_PATH="./cmd/main.go"
# Define the output path for the executable binary
BINARY_NAME="oq_app" # You can change this to your desired binary name
BINARY_PATH="./$BINARY_NAME"

echo "Building Go binary..."
# Build the Go application. This creates an executable binary in the current directory.
go build -o "$BINARY_PATH" "$MAIN_GO_PATH"

# Check if the build was successful
if [ $? -eq 0 ]; then
    echo "Build successful. Running the application..."
    # Run the newly built binary with the specified argument
    "$BINARY_PATH" example_code/test.oq
else
    echo "Build failed. Please check for errors in your Go code."
    exit 1
fi
