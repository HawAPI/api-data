package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"os"
	"path/filepath"
	"strings"
)

var singleFile bool

// Function to process a single JSON object and generate an SQL INSERT statement
func processObject(data map[string]interface{}, dbName string) string {
	// Generate SQL INSERT statement
	columns := []string{}
	values := []string{}

	for key, value := range data {
		switch v := value.(type) {
		case nil:
			continue
		case string:
			// Escape single quotes in the string
			escapedValue := strings.ReplaceAll(v, "'", "''")
			values = append(values, fmt.Sprintf("'%s'", escapedValue))
		case []interface{}:
			arrValues := []string{}
			for _, item := range v {
				arrValues = append(arrValues, fmt.Sprintf("\"%v\"", item))
			}
			values = append(values, fmt.Sprintf("'{%s}'", strings.Join(arrValues, ",")))
		case float64:
			values = append(values, fmt.Sprintf("%v", int(value.(float64))))
		default:
			values = append(values, fmt.Sprintf("%v", v))
		}

		columns = append(columns, key)
	}

	insertStatement := fmt.Sprintf("INSERT INTO %s (%s) VALUES (%s);",
		dbName,
		strings.Join(columns, ", "),
		strings.Join(values, ", "),
	)

	return insertStatement
}

// Function to process a single JSON file and generate SQL INSERT statements
func processFile(filePath, dbName string) ([]string, error) {
	// Read file content
	byteValue, err := os.ReadFile(filePath)
	if err != nil {
		return nil, err
	}

	// Parse JSON data
	var dataArray []map[string]interface{}
	err = json.Unmarshal(byteValue, &dataArray)
	if err != nil {
		return nil, err
	}

	// Generate SQL INSERT statements for each object in the array
	var insertStatements []string
	for _, data := range dataArray {
		insertStatement := processObject(data, dbName)
		insertStatements = append(insertStatements, insertStatement)
	}

	return insertStatements, nil
}

// Function to append SQL statements to the output file
func appendToFile(outputFilePath string, newSQLStatements []string) error {
	// Open the file in append mode, create it if it doesn't exist
	file, err := os.OpenFile(outputFilePath, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		return err
	}
	defer file.Close()

	// Append each SQL statement to the file
	for _, stmt := range newSQLStatements {
		_, err := file.WriteString(stmt + "\n")
		if err != nil {
			return err
		}
	}

	return nil
}

func readDir(path, outputDir string) {
	// Read all files in the directory
	files, err := os.ReadDir(path)
	if err != nil {
		panic(err)
	}

	for _, file := range files {
		if file.IsDir() {
			readDir(filepath.Join(path, file.Name()), outputDir)
			continue
		}

		if !strings.HasSuffix(file.Name(), ".json") {
			continue
		}

		dbName, _ := strings.CutSuffix(file.Name(), ".json")

		// Process each file
		filePath := filepath.Join(path, file.Name())
		sqlStatements, err := processFile(filePath, dbName)
		if err != nil {
			fmt.Printf("Error processing file %s: %v\n", filePath, err)
			continue
		}

		// Prepare output file path with .sql extension
		outputFileName := strings.TrimSuffix(file.Name(), filepath.Ext(file.Name())) + ".sql"
		if singleFile {
			outputFileName = "hawapi.sql"
		}

		outputFilePath := filepath.Join(outputDir, outputFileName)

		// Append SQL statements to output SQL file
		err = appendToFile(outputFilePath, sqlStatements)
		if err != nil {
			fmt.Printf("Error appending SQL statements to file %s: %v\n", outputFilePath, err)
			continue
		}

		fmt.Printf("Processed file %s and appended SQL statements to %s\n", filePath, outputFilePath)
	}
}

func main() {
	flag.BoolVar(&singleFile, "single", true, "")
	flag.Parse()

	// Directory containing JSON files
	dirPath := "database/v1/data"
	outputDir := "database/v1/data/sql"

	// Create the output directory if it does not exist
	if _, err := os.Stat(outputDir); os.IsNotExist(err) {
		err = os.Mkdir(outputDir, 0755)
		if err != nil {
			panic(err)
		}
	}

	readDir(dirPath, outputDir)
}
