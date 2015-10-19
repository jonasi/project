package brew

// https://github.com/Homebrew/homebrew/blob/master/share/doc/homebrew/Querying-Brew.md

import (
	"encoding/json"
	"io"
	"os/exec"
)

func cmd(dest interface{}, args ...string) error {
	r, w := io.Pipe()
	dec := json.NewDecoder(r)

	cmd := exec.Command("brew", args...)
	cmd.Stdout = w

	if err := cmd.Start(); err != nil {
		return err
	}

	return dec.Decode(dest)
}

type Formula struct {
	Name        string `json:"name"`
	FullName    string `json:"full_name"`
	Version     string `json:"version"`
	Description string `json:"desc"`
	Homepage    string `json:"homepage"`
	OldName     string `json:"oldname"`
	Versions    struct {
		Stable string `json:"stable"`
		Bottle bool   `json:"bottle"`
		Devel  string `json:"devel"`
		HEAD   string `json:"head"`
	} `json:"versions"`
	Revision  int `json:"revision"`
	Installed []struct {
		Version          string   `json:"version"`
		UsedOptions      []string `json:"used_options"`
		BuiltAsBottle    bool     `json:"built_as_bottle"`
		PouredFromBottle bool     `json:"poured_from_bottle"`
	} `json:"installed"`
	LinkedKeg     string   `json:"linked_keg"`
	KegOnly       bool     `json:"keg_only"`
	Dependencies  []string `json:"dependecies"`
	ConflictsWith []string `json:"conflicts_with"`
	Caveats       string   `json:"caveats"`
	Requirements  []struct {
		Name           string `json:"name"`
		DefaultFormula string `json:"default_formula"`
		Cask           string `json:"cask"`
		Download       string `json:"download"`
	} `json:"requirements"`
	Options []struct {
		Option      string `json:"option"`
		Description string `json:"description"`
	} `json:"options"`
	Bottle map[string]struct {
		Revision int    `json:"revision"`
		Cellar   string `json:"cellar"`
		Prefix   string `json:"prefix"`
		RootURL  string `json:"root_url"`
		Files    map[string]struct {
			URL    string `json:"url"`
			Sha256 string `json:"sha256"`
		} `json:"files"`
	} `json:"bottle"`
}

func Version() (string, error) {
	return "", nil
}

func List() ([]*Formula, error) {
	formulae := []*Formula{}
	err := cmd(&formulae, "info", "--installed", "--json=v1")

	if err != nil {
		return nil, err
	}

	return formulae, nil
}

func Info(name string) (*Formula, error) {
	var f []Formula
	err := cmd(&f, "info", "--json=v1", name)

	if err != nil {
		return nil, err
	}

	return &f[0], nil
}

func Install(name string) (*Formula, error) {
	return nil, nil
}

func Upgrade(name string) (*Formula, error) {
	return nil, nil
}

func Update() error {
	return nil
}
