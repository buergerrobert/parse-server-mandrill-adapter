var mandrill = require('mandrill-api/mandrill');

var MandrillAdapter = mandrillOptions => {

  var clientsMode = false;
  if (
    !mandrillOptions ||
    !mandrillOptions.apiKey
  ) {
    throw 'MandrillAdapter requires an API Key.';
  } else if (
    mandrillOptions &&
    mandrillOptions.clientsMap
  ) {
    if (!mandrillOptions.clientIdentifierKey) {
      throw 'If you want to use the multi client feature, you have to provide a client identifier key.'
    } else if (!isClientsMapValid()) {
      throw 'If you want to use the multi client feature, you have to provide a valid client map.';
    } else {
      clientsMode = true;
    }
  } else if (
    mandrillOptions &&
    !mandrillOptions.clientsMap &&
    !mandrillOptions.fromEmail
  ) {
    throw 'MandrillAdapter requires a From Email Address.';
  }

  mandrillOptions.replyTo =
    mandrillOptions.replyTo ||
    mandrillOptions.fromEmail;
  mandrillOptions.displayName =
    mandrillOptions.displayName ||
    mandrillOptions.replyTo;
  mandrillOptions.verificationSubject =
    mandrillOptions.verificationSubject ||
    'Please verify your e-mail for *|appname|*';
  mandrillOptions.verificationBody =
    mandrillOptions.verificationBody ||
    'Hi,\n\nYou are being asked to confirm the e-mail address *|email|* ' +
    'with *|appname|*\n\nClick here to confirm it:\n*|link|*';
  mandrillOptions.passwordResetSubject =
    mandrillOptions.passwordResetSubject ||
    'Password Reset Request for *|appname|*';
  mandrillOptions.passwordResetBody =
    mandrillOptions.passwordResetBody ||
    'Hi,\n\nYou requested a password reset for *|appname|*.\n\nClick here ' +
    'to reset it:\n*|link|*';
  mandrillOptions.customUserAttributesMergeTags = mandrillOptions.customUserAttributesMergeTags || [];

  var mandrill_client = new mandrill.Mandrill(mandrillOptions.apiKey);

  var sendVerificationEmail = options => {
    var displayName = getDisplayName(options.user, options.appName);
    var global_merge_vars = [
      { name: 'appname', content: displayName },
      { name: 'username', content: options.user.get("username") },
      { name: 'email', content: options.user.get("email") },
      { name: 'link', content: options.link }
    ];

    if (typeof mandrillOptions.customUserAttributesMergeTags !== 'undefined') {
      for (var extra_attr of mandrillOptions.customUserAttributesMergeTags) {
        global_merge_vars.push({ name: extra_attr, content: options.user.get(extra_attr) || '' });
      }
    }

    var subject = getTranslatableValueFromOptionsOrClientMap("verificationSubject", options.user);
    var fromEmail = getValueFromOptionsOrClientMap("fromEmail");
    var replyTo = getValueFromOptionsOrClientMap("replyTo");

    var message = {
      from_email: fromEmail,
      from_name: displayName,
      headers: {
        'Reply-To': replyTo
      },
      to: [{
        email: options.user.get("email")
      }],
      subject: subject,
      text: mandrillOptions.verificationBody,
      global_merge_vars: global_merge_vars
    };

    return new Promise((resolve, reject) => {
      if (mandrillOptions.verificationTemplateName || clientsMode) {
        var template = getTranslatableValueFromOptionsOrClientMap("verificationTemplateName", options.user);
        mandrill_client.messages.sendTemplate(
          {
            template_name: template,
            template_content: [],
            message: message,
            async: true
          },
          resolve,
          reject
        )
      } else {
        mandrill_client.messages.send(
          {
            message: message,
            async: true
          },
          resolve,
          reject
        )
      }
    });
  };

  var sendPasswordResetEmail = options => {
    var displayName = getDisplayName(options.user, options.appName);
    var global_merge_vars = [
      { name: 'appname', content: displayName },
      { name: 'username', content: options.user.get("username") },
      { name: 'email', content: options.user.get("email") },
      { name: 'link', content: options.link }
    ];

    if (typeof mandrillOptions.customUserAttributesMergeTags !== 'undefined') {
      for (var extra_attr of mandrillOptions.customUserAttributesMergeTags) {
        global_merge_vars.push({ name: extra_attr, content: options.user.get(extra_attr) || '' });
      }
    }

    var subject = getTranslatableValueFromOptionsOrClientMap("passwordResetSubject", options.user);
    var fromEmail = getValueFromOptionsOrClientMap("fromEmail");
    var replyTo = getValueFromOptionsOrClientMap("replyTo");

    var message = {
      from_email: fromEmail,
      from_name: displayName,
      headers: {
        'Reply-To': replyTo
      },
      to: [{
        email: options.user.get("email") || options.user.get("username")
      }],
      subject: subject,
      text: mandrillOptions.passwordResetBody,
      global_merge_vars: global_merge_vars
    };

    return new Promise((resolve, reject) => {
      if (mandrillOptions.passwordResetTemplateName || clientsMode) {
        var template = getTranslatableValueFromOptionsOrClientMap("passwordResetTemplateName", options.user);
        mandrill_client.messages.sendTemplate(
          {
            template_name: template,
            template_content: [],
            message: message,
            async: true
          },
          resolve,
          reject
        )
      } else {
        mandrill_client.messages.send(
          {
            message: message,
            async: true
          },
          resolve,
          reject
        )
      }
    });
  };

  var sendMail = options => {
    var message = {
      from_email: mandrillOptions.fromEmail,
      from_name: mandrillOptions.displayName,
      headers: {
        'Reply-To': mandrillOptions.replyTo
      },
      to: [{
        email: options.to
      }],
      subject: options.subject,
      text: options.text
    };

    return new Promise((resolve, reject) => {
      mandrill_client.messages.send(
        {
          message: message,
          async: true
        },
        resolve,
        reject
      )
    });
  };

  function getDisplayName(user, appName) {
    if (clientsMode) {
      var client = mandrillOptions.clientsMap[user.get(mandrillOptions.clientIdentifierKey)];
      return client.displayName;
    } else {
      return appName;
    }
  }

  function getTranslatableValueFromOptionsOrClientMap(key, user) {
    var userLang = user.get("language");
    var value = "";
    if (clientsMode) {
      var client = mandrillOptions.clientMap[user.get(mandrillOptions.clientIdentifierKey)];
      value = client[key].default;
      if (userLang) {
        userLang = userLang.toUpperCase();
        if (userLang in client[key]) {
          value = client[key][userLang];
        }
      }
    } else {
      value = mandrillOptions[key];
      if (userLang) {
        userLang = userLang.toUpperCase();
        if (key + userLang in mandrillOptions) {
          value = mandrillOptions[key + userLang];
        }
      }
    }
    return value;
  }

  function getValueFromOptionsOrClientMap(key, user) {
    var value = "";
    if (clientsMode) {
      var client = mandrillOptions.clientMap[user.get(mandrillOptions.clientIdentifierKey)];
      value = client[key];
    } else {
      value = mandrillOptions[key];
    }
    return value;
  }

  function isClientsMapValid() {
    for (let clientData of Object.values(mandrillOptions.clientsMap)) {
      if (((clientData || {})["verificationSubject"] || {})["default"] == null ||
        ((clientData || {})["verificationTemplateName"] || {})["default"] == null ||
        ((clientData || {})["passwordResetSubject"] || {})["default"] == null ||
        ((clientData || {})["passwordResetTemplateName"] || {})["default"] == null ||
        (clientData || {})["displayName"] == null ||
        (clientData || {})["fromEmail"] == null ||
        (clientData || {})["replyTo"] == null) {
        return false;
      }
    }
    return true;
  }

  return Object.freeze({
    sendVerificationEmail: sendVerificationEmail,
    sendPasswordResetEmail: sendPasswordResetEmail,
    sendMail: sendMail
  });
};

module.exports = MandrillAdapter;
