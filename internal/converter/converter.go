package converter

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strings"
)

type Converter struct {
	inputDir, outputDir string
	singleFile          bool
}

func New(inputDir, outputDir string, singleFile bool) Converter {
	return Converter{
		inputDir,
		outputDir,
		singleFile,
	}
}

func (c *Converter) Start() error {
	err := c.processFiles(c.inputDir)
	if err != nil {
		return err
	}

	return nil
}

// processObject will generate an SQL INSERT statement
func (c *Converter) processObject(data map[string]interface{}, db string) string {
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

	return fmt.Sprintf("INSERT INTO %s (%s) VALUES (%s);",
		db,
		strings.Join(columns, ", "),
		strings.Join(values, ", "),
	)
}

// processFile will process a single JSON file
func (c *Converter) processFile(filePath, db string) ([]string, error) {
	file, err := os.ReadFile(filePath)
	if err != nil {
		return nil, err
	}

	var data []map[string]interface{}
	err = json.Unmarshal(file, &data)
	if err != nil {
		return nil, err
	}

	var statements []string
	for _, ob := range data {
		statement := c.processObject(ob, db)
		statements = append(statements, statement)
	}

	return statements, nil
}

// appendToFile will append SQL statements to the output file
func (c *Converter) appendToFile(outFilePath string, statements []string) error {
	// Open the file in append mode, create it if it doesn't exist
	file, err := os.OpenFile(outFilePath, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		return err
	}
	defer file.Close()

	for _, stmt := range statements {
		_, err := file.WriteString(stmt + "\n")
		if err != nil {
			return err
		}
	}

	return nil
}

func (c *Converter) processFiles(dir string) error {
	files, err := os.ReadDir(dir)
	if err != nil {
		panic(err)
	}

	for _, file := range files {
		if file.IsDir() {
			c.processFiles(filepath.Join(dir, file.Name()))
			continue
		}

		if !strings.HasSuffix(file.Name(), ".json") {
			continue
		}

		db, _ := strings.CutSuffix(file.Name(), ".json")
		if strings.Contains(db, "overview") {
			db = strings.ReplaceAll(db, "overview", "overviews")
		}

		filePath := filepath.Join(dir, file.Name())
		sqlStatements, err := c.processFile(filePath, db)
		if err != nil {
			fmt.Printf("Error processing file %s: %v\n", filePath, err)
			continue
		}

		outFileName := strings.TrimSuffix(file.Name(), ".json") + ".sql"
		if c.singleFile {
			outFileName = "hawapi.sql"
		}

		outFilePath := filepath.Join(c.outputDir, outFileName)
		err = c.appendToFile(outFilePath, sqlStatements)
		if err != nil {
			fmt.Printf("Error appending SQL statements to file %s: %v\n", outFilePath, err)
			continue
		}

		fmt.Printf("Processed file %s and appended SQL statements to %s\n", filePath, outFilePath)
	}

	return nil
}
