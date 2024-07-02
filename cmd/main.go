package main

import (
	"flag"
	"fmt"
	"os"

	"github.com/HawAPI/api-data/internal/converter"
)

func main() {
	var singleFile bool
	var inputDir string
	var outputDir string

	flag.BoolVar(&singleFile, "single", true, "define if output will be in a single or multiple files")
	flag.StringVar(&inputDir, "in", "database/v1/data", "input directory")
	flag.StringVar(&outputDir, "out", "database/v1/data/sql", "output directory")
	flag.Parse()
	flag.Usage = cmdUsage

	// Create the output directory if it does not exist
	if _, err := os.Stat(outputDir); os.IsNotExist(err) {
		err = os.Mkdir(outputDir, 0755)
		if err != nil {
			panic(err)
		}
	}

	conv := converter.New(inputDir, outputDir, singleFile)
	err := conv.Start()
	if err != nil {
		panic(err)
	}
}

func cmdUsage() {
	w := flag.CommandLine.Output()
	fmt.Fprintf(w, "Usage of %s: \n", os.Args[0])
	flag.PrintDefaults()
}
