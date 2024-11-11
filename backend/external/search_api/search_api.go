package search_api

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net"
	"net/http"
	"os"
	"time"
)

const (
	// authKeyURL -
	authKeyURL = "%s/key/%s/auth?req_type=%s&orig_path=%s&orig_method=%s"
	// verifyTokenURL...
	verifyTokenURL = "%s/auth/token/verify?%s"
	// apiName -
	apiName = "exporter"
)

const (
	scheme  = "http"
	timeout = 100 * time.Second
)

const (
	// ErrUnauthorized The error message got no permission from Enforcer
	ErrUnauthorized = "unauthorized"
)

// HTTPClient defines an interface that declares the `Do` method
type HTTPClient interface {
	Do(req *http.Request) (*http.Response, error)
	Get(string) (*http.Response, error)
}

type client struct {
	//log     *logrus.Logger
	baseURL string

	client HTTPClient
}

// Option used to change default value of client's fields
type Option func(*client)

//// WithLog set log for key client
//func WithLog(log *logrus.Logger) Option {
//	return func(c *client) {
//		c.log = log
//	}
//}

// WithHTTPClient used to set custom http client
func WithHTTPClient(httpClient HTTPClient) Option {
	return func(c *client) {
		c.client = httpClient
	}
}

// Transport custom-defines fields in http.Transport
type transport struct {
	Timeout time.Duration
	// add more fields here if they need to be customized
}

func (T *transport) transport() *http.Transport {
	return &http.Transport{
		Dial: (&net.Dialer{
			Timeout: T.Timeout,
		}).Dial,
		// https://github.com/OJ/gobuster/issues/127
		// MaxIdleConns and MaxIdleConnsPerHost values are supposed to be equal, experimental value 50.
		MaxIdleConns:        50,
		MaxIdleConnsPerHost: 50,
		TLSHandshakeTimeout: T.Timeout,
	}
}

// New returns new instance of model client
func New(opts ...Option) ISearchClient {
	baseURL := fmt.Sprintf("%s://%s", scheme, getSearchAPIHost())

	transport := transport{Timeout: timeout}

	c := &client{
		client: &http.Client{
			Timeout:   timeout,
			Transport: transport.transport(),
		},
		baseURL: baseURL,
		//log:     logger.Logger(),
	}

	for _, opt := range opts {
		opt(c)
	}
	return c
}

// getKeyAPIHost returns host of KeyAPI
func getSearchAPIHost() string {
	//if keyServicePort := os.Getenv("KEY_SERVICE_PORT"); keyServicePort != "" {
	//	return fmt.Sprintf("0.0.0.0:%s", keyServicePort)
	//}
	//return "key-api-svc.default.svc.cluster.local"
	return ""
}

// A Response struct to map the Entire Response
type Response struct {
	Name    string    `json:"name"`
	Pokemon []Pokemon `json:"pokemon_entries"`
}

// A Pokemon Struct to map every pokemon to.
type Pokemon struct {
	EntryNo int            `json:"entry_number"`
	Species PokemonSpecies `json:"pokemon_species"`
}

// A struct to map our Pokemon's Species which includes it's name
type PokemonSpecies struct {
	Name string `json:"name"`
}

// SearchPost calls KeyAPI to authorize api key with request info
func (c *client) SearchPost(param string) ([]byte, error) {
	response, err := http.Get("http://pokeapi.co/api/v2/pokedex/kanto/")
	if err != nil {
		fmt.Print(err.Error())
		os.Exit(1)
	}

	responseData, err := ioutil.ReadAll(response.Body)
	if err != nil {
		log.Fatal(err)
	}

	var responseObject Response
	json.Unmarshal(responseData, &responseObject)

	fmt.Println(responseObject.Name)
	fmt.Println(len(responseObject.Pokemon))

	for i := 0; i < len(responseObject.Pokemon); i++ {
		fmt.Println(responseObject.Pokemon[i].Species.Name)
	}
	return responseData, nil
}
