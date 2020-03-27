# parse-server-mandrill-adapter
Used to send Parse Server password reset and email verification emails through Mandrill, supporting templates.

How to install:
```
$ npm install parse-server-mandrill-adapter --save
```

How to use:
```javascript
var server = ParseServer({
  ...
  // App Name
  appName: 'YourAppName',
  // Environment where the user can confirm his e-mail address or reset his password (most likely the same as your 'serverURL')
  publicServerURL: 'YourPublicServerURL',
  emailAdapter: {
    module: 'parse-server-mandrill-adapter',
    options: {
      // API key from Mandrill account
      apiKey: 'API-KEY',
      // From email address
      fromEmail: 'no-reply@yourdomain.com',
      // Display name
      displayName: 'no-reply@yourdomain.com',
      // Reply-to email address
      replyTo: 'no-reply@yourdomain.com',
      // Verification email subject
      verificationSubject: 'Please verify your e-mail for *|appname|*',
      // Verification email body. This will be ignored when verificationTemplateName is used.
      verificationBody: 'Hi *|username|*,\n\nYou are being asked to confirm the e-mail address *|email|* with *|appname|*\n\nClick here to confirm it:\n*|link|*',
      // Password reset email subject
      passwordResetSubject: 'Password Reset Request for *|appname|*',
      // Password reset email body. This will be ignored when passwordResetTemplateName is used.
      passwordResetBody: 'Hi *|username|*,\n\nYou requested a password reset for *|appname|*.\n\nClick here to reset it:\n*|link|*',

      /****************************************
       * If you are using Mandrill templates: *
       ****************************************/

      //
      // If you want to use other custom User attributes in the emails
      // (for example: firstName, lastName), add them to the list (username and email 
      // are pre-loaded).
      // The merge tag in the template must be equal to the attribute's name.
      customUserAttributesMergeTags: ['firstname', 'lastname'],

      //
      // The name of your Mandrill template for the password reset email:
      // If you add this attribute, then passwordResetBody will be ignored.
      // IMPORTANT: Make sure the email has the *|link|* merge tag,
      //            it will render the url to reset the password.
      passwordResetTemplateName: 'password-reset-template-name',

      //
      // The name of your Mandrill template for the verification email:
      // If you add this attribute, then verificationBody will be ignored.
      // IMPORTANT: Make sure the email has the *|link|* merge tag,
      //            it will render the url to verify the user.
      verificationTemplateName: 'email-verification-template-name',
      
      // If you have localized templates, you can append the country code of the language like this:
      verificationTemplateNameEN: 'email-verification-template-name-en'
      // The language of the user (key 'language' in the user object) will be used to match the template
      // suffix (in this case 'EN'). If there is no match, the fallback will be the 'verificationTemplateName'
      
      /************************************************
       * If you want to use the multi client feature: *
       ***********************************************/
      // The key in the user object to find out which client he is using. In this case the content 
      // has to match either 'clientA' or 'clientB'
      clientIdentifierKey: 'registeredApp',
      // The fallback client that will be used when there is no data in the field 'clientIdentifierKey' or no match
      // in the clientsMap
      fallbackClient: 'clientA',
      clientsMap: {
        // The root level keys have to match the values of the user object field defined in 'clientIdentifierKey'
        clientA: {
          displayName: 'Client A',
          fromEmail: 'client-a@example.org',
          replyTo: 'client-a@example.org',
          // For the fields 'verificationSubject', 'verificationTemplateName', 'passwordResetSubject' and 'passwordResetTemplateName' 
          // you always need to specify a default value and it's possible to also use country codes that will be matched with the users
          // language to send him localized emails. If there is no match for his language, the 'default' value will be used
          verificationSubject: {
            default: "Please verify your email address",
            DE: "Bitte verifiziere deine Email Adresse"
          },
          verificationTemplateName: {
            default: "verification-template-client-a",
            DE: "verification-template-client-a-de"
          },
          passwordResetSubject: {
            default: "Password reset for *|appname|*",
            DE: "Passwort zurücksetzen für *|appname|*"
          },
          passwordResetTemplateName: {
            default: "password-reset-template-client-a",
            DE: "password-reset-template-client-a-de"
          }
        },
        clientB: {
          displayName: 'Client B',
          fromEmail: 'client-b@example.org',
          replyTo: 'client-b@example.org',
          verificationSubject: {
            default: "Please verify your email address",
            EN: "Please verify your email address for *|appname|*"
          },
          verificationTemplateName: {
            default: "verification-template-client-b",
            EN: "verification-template-client-b-en",
          },
          passwordResetSubject: {
            default: "Password reset",
            EN: "Password reset for *|appname|*"
          },
          passwordResetTemplateName: {
            default: "password-reset-template-client-b",
            EN: "password-reset-template-client-b-en"
          }
        }
      }
    }
  }
  ...
});
```

You can use the following variables in the subjects and bodies and they will be replaced with their appropriate values:

`*|appname|*` - your application's display name

`*|username|*` - the user's display name

`*|email|*` - the user's email address

`*|link|*` - the link the user must click to perform the requested action

Note that these variable tokens are formatted using the `MailChimp` merge language. If your Mandrill account is using the `Handlebars` merge language, you should use the alternative format, e.g. `{{appname}}`, `{{username}}`, etc. The Mandrill merge language style can be configured in your Mandrill settings under 'Sending Defaults'.

Developers groups:
https://groups.google.com/forum/#!forum/back4app

Parse hosting:
https://www.back4app.com
