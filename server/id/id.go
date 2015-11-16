package id

import (
	"encoding/json"
	"errors"
	"github.com/pborman/uuid"
	"sort"
)

var ErrInvalid = errors.New("Invalid bytes")

func FromString(str string) (ID, error) {
	b := uuid.Parse(str)

	if b == nil {
		return nil, ErrInvalid
	}

	return ID(b), nil
}

type ID []byte

func (i ID) MarshalText() ([]byte, error) {
	return i, nil
}

func (i *ID) UnmarshalText(b []byte) error {
	id, err := FromString(string(b))

	if err != nil {
		return err
	}

	*i = id
	return nil
}

func (i ID) MarshalJSON() ([]byte, error) {
	return json.Marshal(i.String())
}

func (i *ID) UnmarshalJSON(b []byte) error {
	id, err := FromString(string(b))

	if err != nil {
		return err
	}

	*i = id
	return nil
}

func (i ID) String() string {
	return uuid.UUID(i).String()
}

func (i ID) Equal(id ID) bool {
	return uuid.Equal(uuid.UUID(i), uuid.UUID(id))
}

func New() ID {
	return ID(uuid.NewUUID())
}

func Sort(ids []ID) {
	sort.Sort(sorted(ids))
}

type sorted []ID

func (s sorted) Len() int      { return len(s) }
func (s sorted) Swap(i, j int) { s[i], s[j] = s[j], s[i] }
func (s sorted) Less(i, j int) bool {
	a, _ := uuid.UUID(s[i]).Time()
	b, _ := uuid.UUID(s[j]).Time()

	return int64(a) < int64(b)
}
