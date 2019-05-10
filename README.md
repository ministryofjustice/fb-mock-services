# FB Mocks

## Installation

`npm install`

## Usage

`npm start`

This starts mocked services on these ports

- 44444 - User Datastore
- 44445 - User Filestore
- 44446 - Submitter

You can now run the runner or editor with a command like so

``` sh
cd /path/to/runner-or-editor

SERVICE_SLUG=slug \
SERVICE_SECRET=secret \
SERVICE_TOKEN=token \
USER_DATASTORE_URL=http://localhost:44444 \
USER_FILESTORE_URL=http://localhost:44445 \
USER_FILESTORE_URL=http://localhost:44446 \
SERVICE_PATH=/path/to/form \
npm start
```

### Setting alternative ports

```sh
USER_DATASTORE=4001 \
USER_FILESTORE=4002 \
SUBMITTER=4003 \
npm start
```

## Utils

- [Postman collection](utils/fb-mocks.postman_collection.json)
- [Postman environment](utils/fb-mocks.postman_environment.json)
