package main

import (
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
)

func save(w http.ResponseWriter, r *http.Request) {

    // Read the request body
    body, err := io.ReadAll(r.Body)
    if err != nil {
        http.Error(w, "Failed to read request body", http.StatusBadRequest)
        return
    }
    defer r.Body.Close() // Close the body after reading

    path := os.Getenv("EDITOR_FILE")
    err = os.WriteFile(path, body, 0644)
    if err != nil {
        http.Error(w, "Failed to write file", http.StatusBadRequest)
        return
    }

    // Respond to the client
    w.WriteHeader(http.StatusOK)
}

func main() {
	fs := http.FileServer(http.Dir("./src"))
	http.Handle("/", fs)
	http.HandleFunc("/save", save)

	http.HandleFunc("/get", func(w http.ResponseWriter, r *http.Request) {
        path := os.Getenv("EDITOR_FILE")
        body, err := os.ReadFile(path)
        if err != nil {
            http.Error(w, "Failed to write file", http.StatusBadRequest)
            return
        }
        fmt.Fprintf(w, string(body))
    })

	log.Print("Listening on :3000...")
	err := http.ListenAndServe(":3000", nil)
	if err != nil {
		log.Fatal(err)
	}
}
