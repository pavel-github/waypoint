package statetest

import (
	"crypto/rand"
	"fmt"
	"testing"

	ulidpkg "github.com/oklog/ulid"

	"github.com/hashicorp/waypoint/internal/serverstate"
)

type (
	// Factory is the function type used to create a new serverstate
	// implementation. To fail, this should fail the test.
	Factory func(*testing.T) serverstate.Interface

	// RestartFactory functions simulate a server restart. This should
	// gracefully close the existing interface given and create a new one
	// using the same data store. Therefore, data persisted in the first
	// version should become visible in the second.
	//
	// This SHOULD simulate a physical restart as much as possible. Therefore,
	// do NOT just return the same state pointer. Try to clean up, reopen disks,
	// reconnect to databases, etc. This is used as part of failure testing,
	// snapshot restore, etc.
	RestartFactory func(*testing.T, serverstate.Interface) serverstate.Interface
)

// Test runs a validation test suite for a state implementation. All
// state implementations should pass this suite with no errors to ensure
// the correct behavior of the state when Waypoint uses it.
func Test(t *testing.T, f Factory, rf RestartFactory) {
	for name, funcs := range tests {
		t.Run(name, func(t *testing.T) {
			for _, tf := range funcs {
				tf(t, f, rf)
			}
		})
	}
}

// TestGroup runs a specific group of validation tests for a state implementation.
func TestGroup(t *testing.T, name string, f Factory, rf RestartFactory) {
	funcs, ok := tests[name]
	if !ok {
		panic(fmt.Sprintf("unknown test group: %s", name))
	}

	t.Run(name, func(t *testing.T) {
		for _, tf := range funcs {
			tf(t, f, rf)
		}
	})
}

// tests is the list of tests to run.
var tests = map[string][]testFunc{}

// testFunc is the type of the function that a test that is run as part of
// Test implements. This is an internal only type.
type testFunc func(*testing.T, Factory, RestartFactory)

// ulid returns a unique ULID.
func ulid() (string, error) {
	id, err := ulidpkg.New(ulidpkg.Now(), rand.Reader)
	if err != nil {
		return "", err
	}

	return id.String(), nil
}
