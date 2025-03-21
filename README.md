# Combine CSV Files

This Electron application allows you to select multiple CSV files and merge them into a single CSV file.

## Features

- Select multiple CSV files
- Merge selected CSV files into one
- Remove trailing newline characters from the merged CSV file

## Installation

1. Clone the repository:
   ```sh
   git clone <repository-url>
   cd combine_csv
   ```

2. Install dependencies:
   ```sh
   npm install
   ```

## Usage

1. Start the application:
   ```sh
   npm start
   ```

2. In the application window, click the button to select CSV files.

3. After selecting the files, the application will merge them and save the result as `merged.csv` in the project directory.

## Development

To run the application in development mode with live reload:
```sh
npm run dev
```

## Packaging

To package the application into an executable file, run the following command:
```sh
npm run package
```

This will create a `dist` directory containing the packaged application.

## License

This project is licensed under the MIT License.
