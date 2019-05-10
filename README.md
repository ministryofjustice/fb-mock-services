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

### Enabling sending of emails

```sh
MAIL=yes npm start
```

#### Configuring sendmail.postfix on OS X

<!--
http://www.marcelofossrj.com/recipe/2018/07/12/sendmail-highsierra.html
https://www.developerfiles.com/how-to-send-emails-from-localhost-mac-os-x-el-capitan/
-->

##### 1. Create app password

If you're using your `digital.justice.gov.uk` account to send from, you need to use an [app password](https://support.google.com/accounts/answer/185833)

[Create a Google app password](https://myaccount.google.com/apppasswords)

##### 2. Edit postfix configuration

```sh
sudo vi /etc/postfix/main.cf
```

Add the following:

```sh
### Additions
relayhost=smtp.gmail.com:587
smtp_sasl_auth_enable=yes
smtp_sasl_password_maps=hash:/etc/postfix/sasl_passwd
smtp_use_tls=yes
smtp_tls_security_level=encrypt
smtp_sasl_security_options = noanonymous
smtp_always_send_ehlo = yes
smtp_sasl_mechanism_filter = plain
```

##### 3. Create sasl_passwd file for postifx

```sh
sudo vi /etc/postfix/sasl_passwd
```

Add the follwing

```
smtp.gmail.com:587 your_email@digital.justice.gov.uk:your_password
```

Create the Postfix lookup table from the sasl_passwd file

```sh
sudo postmap /etc/postfix/sasl_passwd
```

##### 4. Start postfix

If postfix is not running

```sh
sudo postfix start
```

otherwise

```sh
sudo postfix reload
```

## Utils

- [Postman collection](utils/fb-mocks.postman_collection.json)
- [Postman environment](utils/fb-mocks.postman_environment.json)
