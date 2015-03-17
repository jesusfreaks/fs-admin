//This file is included in .gitignore and should hold your local configuration overrides
angular._localConfig = {
    environment: 'development', //show debug messages
    API: {
        protocol: 'https',
        host: 'dev-fs-rest-service.herokuapp.com',
        port:443,
        useMocks: true,
        fakeDelay: 800
    }
}
;
