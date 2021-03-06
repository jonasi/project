package main

// https://github.com/Homebrew/homebrew/blob/master/share/doc/homebrew/Querying-Brew.md

import (
	"io/ioutil"
	"path/filepath"
	"strings"

	"github.com/jonasi/project/server/exec"
)

func LocalVersion() (*Version, error) {
	var (
		v   Version
		fmt = "Homebrew %s (git revision %s last commit"
	)

	err := exec.Command("brew", "--version").RunScanf(fmt, &v.Version, &v.Revision)

	if err != nil {
		return nil, err
	}

	// strip trailing ;
	v.Revision = v.Revision[:len(v.Revision)-1]

	return &v, nil
}

func ListAll() ([]*Formula, error) {
	f, err := allFormulaNames()

	if err != nil {
		return nil, err
	}

	var (
		formulae = []*Formula{}
		args     = append([]string{"info", "--json=v1"}, f...)
	)

	err = exec.Command("brew", args...).RunJSON(&formulae)

	if err != nil {
		return nil, err
	}

	return formulae, nil
}

func ListInstalled() ([]*Formula, error) {
	var (
		formulae = []*Formula{}
		err      = exec.Command("brew", "info", "--installed", "--json=v1").RunJSON(&formulae)
	)

	if err != nil {
		return nil, err
	}

	return formulae, nil
}

func Info(name string) (*Formula, error) {
	var (
		f   []Formula
		err = exec.Command("brew", "info", "--json=v1", name).RunJSON(&f)
	)

	if err != nil {
		return nil, err
	}

	return &f[0], nil
}

func Install(name string) (string, error) {
	return exec.Command("brew", "install", name).StringOutput(true)
}

func Remove(name string) (string, error) {
	return exec.Command("brew", "remove", name).StringOutput(true)
}

func Upgrade(name string) (string, error) {
	return exec.Command("brew", "upgrade", name).StringOutput(true)
}

func parseConfig(b []byte) map[string]string {
	var (
		mp    = map[string]string{}
		lines = strings.Split(strings.TrimSpace(string(b)), "\n")
	)

	for _, l := range lines {
		parts := strings.SplitN(l, ":", 2)
		mp[strings.TrimSpace(parts[0])] = strings.TrimSpace(parts[1])
	}

	return mp
}

func parseEnv(b []byte) map[string]string {
	var (
		mp    = map[string]string{}
		lines = strings.Split(strings.TrimSpace(string(b)), "\n")
	)

	for _, l := range lines {
		l = l[7:]                                // strip `export `
		parts := strings.SplitN(l, "=", 2)       // k="v"
		parts[1] = parts[1][1 : len(parts[1])-1] // strip quotes on value
		mp[parts[0]] = parts[1]
	}

	return mp
}

func Config() (map[string]string, error) {
	b, err := exec.Command("brew", "config").Output()

	if err != nil {
		return nil, err
	}

	return parseConfig(b), nil
}

func Env() (map[string]string, error) {
	b, err := exec.Command("brew", "--env").Output()

	if err != nil {
		return nil, err
	}

	return parseEnv(b), nil
}

func Update() error {
	return nil
}

func allFormulaNames() ([]string, error) {
	d, err := dir()

	if err != nil {
		return nil, err
	}

	fi, err := ioutil.ReadDir(d)

	if err != nil {
		return nil, err
	}

	form := []string{}

	for _, f := range fi {
		n := f.Name()

		if !f.IsDir() && strings.HasSuffix(n, ".rb") {
			form = append(form, n[:len(n)-3])
		}
	}

	return form, nil
}

func dir() (string, error) {
	str, err := exec.Command("brew", "--prefix").StringOutput(true)

	if err != nil {
		return "", err
	}

	return filepath.Join(str, "Library", "Formula"), nil
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

type Version struct {
	Version  string `json:"version"`
	Revision string `json:"revision"`
}
