var require = {
    baseUrl: "js",
    paths: {
        jquery: ['vendor/jquery-1.9.1.min', '//ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min'],
        'socket.io': ['/socket.io/socket.io'],
        box2d: ['vendor/Box2dWeb-2.1.a.3'],
        b2: 'b2',
        canvasquery: ['vendor/canvasquery'],
        noise: ['vendor/noise'],
        stats: ['vendor/stats'],
        seedrandom: ['vendor/seedrandom'],
        underscore: ['vendor/underscore'],
        maybe: 'vendor/maybe',
    },
    shim: {
        box2d: {
            exports: 'Box2D'
        },
        noise: {
            exports: 'ClassicalNoise'
        },
        stats: {
            exports: 'Stats'
        },
        underscore: {
            exports: '_'
        },
        maybe: {
            exports: 'Maybe'
        },
        canvasquery: {
            exports: 'cq'
        },
    }
};
