Passports
---------

### Usage

```
var passports = new Passports();
passports.setConfig(function (request) {
    return {
        instanceId: req.hostname,
        options: {hostname: req.hostname},
    };
});
passports.setInstance(function (options, passport) {
    passport.use(new Strategy(function (username, password, done) {
        done(null, {username: username, host: options.hostname});
    }));

    passport.serializeUser(function (user, cb) {
        cb(null, JSON.stringify(user));
    });

    passport.deserializeUser(function (id, cb) {
        cb(null, JSON.parse(id));
    });
});

app.use(passports.createExpressSession({secret: 'keyboard cat', resave: true, saveUninitialized: false}));
app.use(passports.initialize());
app.use(passports.session());

app.post('/login', passports.authenticate('local', {successRedirect: '/'}));
```
