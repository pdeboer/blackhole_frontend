var app = angular.module('pplibdataanalyzer_frontend.search', [
    'ui.router',
    'angular-storage',
    'angular-jwt',
    'bootstrapLightbox',
    'ngJoyRide'
]);

app.filter('trustAsResourceUrl', ['$sce', function ($sce) {
        return function (val) {
            return $sce.trustAsResourceUrl(val);
        };
    }]);

app.filter('to_trusted', ['$sce', function ($sce) {
        return function (text) {
            return $sce.trustAsHtml(text);
        };
    }]);

app.config(function ($stateProvider) {
    $stateProvider.state('search', {
        url: '/search',
        controller: 'initCtrl',
        templateUrl: 'search/search.html',
        data: {
            requiresLogin: false
        }
    });
});

app.run(function ($rootScope) {
    $rootScope.image = "";
});

app.directive('errSrc', function () {
    return {
        link: function (scope, element, attrs) {
            element.bind('error', function () {
                if (attrs.src != attrs.errSrc) {
                    attrs.$set('src', attrs.errSrc);
                }
            });
        }
    }
});

app.controller('RateCtrl', function HomeController($scope, $rootScope, $http, store, jwtHelper, $state, $location) {

    $scope.isRated = $rootScope.isRated;

    // Rating 
    $scope.rate = 0;
    $scope.max = 10;
    $scope.isReadonly = false;

    $scope.hoveringOver = function (value) {
        $scope.overStar = value;
        $scope.percent = 100 * (value / $scope.max);
    };


    $scope.submit = function () {
        var msg = {
            sdss_id: $rootScope.coordinatesId,
            uuid: store.get('jwt'),
            set_id: 1,
            rating: $scope.rating,
            comment: ($scope.comment) ? $scope.comment : "No comment",
            ip: this.ipAdress
        };
        //console.log(angular.toJson(msg));
        $http.post('/comment', angular.toJson(msg)).
                success(function (data, status, headers, config) {
                    // this callback will be called asynchronously
                    // when the response is available
                }).
                error(function (data, status, headers, config) {
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                }).then(function (response) {
            $scope.isRated = true;
        });


    };

});

app.controller('SearchCtrl', function HomeController($scope, $rootScope, $http, store, jwtHelper, $state, $location, Lightbox) {
                                
    $scope.toggle = function (spectraId) {
        $scope.currentSpectra = "/images/spectra/" + spectraId + ".png";
    };

    // Event handlers
    $scope.editValue = 2;
    $scope.onEditChange = function () {
        $rootScope.changeHandler($scope.editValue, '', $scope.radioValue);
    };
    
    $scope.onCheckBoxChange = function () {
        var test = 2;
        if ($scope.check1Selected) {
            test = 3;
        }

        $rootScope.changeHandler('', test, '');
    };

    $scope.onRadioChange = function () {

        $rootScope.changeHandler($scope.editValue, '', $scope.radioValue);
    };


    $rootScope.changeHandler = function (test, test2, test3) {
        $scope.radioValue = test3;
        //var image = "588017567101026437";
        if (!test) {
            test = 1;
        }

        if (test3 === "normal") {
            test3 = "crosshair/";
        } else {
            test3 = test3 + "/";
        }
        $scope.onEditChangeResult = "/images/" + test + "/" + test3 + $rootScope.image + ".png";

        $rootScope.openLightboxModal = function (images) {

            Lightbox.openModal(images, test - 1);
        };
    };


    $scope.submit = function () {

        var msg = {
            uuid: store.get('jwt'),
            sdss_id: this.coordinatesId,
            question_id: parseInt(this.questionId),
            answer: this.quest,
            ip: this.ipAdress
        };
        //console.log(angular.toJson(msg));
        $http.post('/tasklog', angular.toJson(msg)).
                success(function (data, status, headers, config) {
                    // this callback will be called asynchronously
                    // when the response is available
                }).
                error(function (data, status, headers, config) {
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                }).then(function (response) {
            $location.path('/search');
            window.location.reload(false);

        });



    };

});

app.controller('initCtrl', function HomeController($scope, $http, store, jwtHelper, $rootScope, Lightbox, $templateCache) {

    // Guided mode
    if (store.get("dismiss")) {
        $scope.dismiss = true;
    } else {
        $scope.dismiss = false;
    }

    // Tool templates
    $rootScope.templates = [{
            name: 'boolean_question.html',
            url: 'search/boolean_question.html'
        },
        {
            name: 'comment.html',
            url: 'search/comment.html'
        }];

    $scope.radioValue = 'normal';

    $scope.jwt = store.get('jwt');
    $scope.onCheckBoxChangeResult = "";
    //$scope.decodedJwt = $scope.jwt && jwtHelper.decodeToken($scope.jwt);
    /*
    $http.get('http://ipinfo.io/json').
            success(function (data) {
*/

                $scope.ipAdress = "data.ip";
                $rootScope.ipAdress = "data.ip";
                $http.post("/daemon/nextAction", {
                    jwt: $scope.jwt,
                    ip: "data.ip"
                }).
                        success(function (data, status, headers, config) {
                            
                            if(data == "All tasks are done") {
                                alert("Congratulations, all tasks are done!");
                            }
                            $scope.action = data;

                            // iframe
                            $scope.sdssUrl = "http://skyserver.sdss.org/dr7/en/tools/explore/obj.asp?ra=" + data.return[0].ra + "&dec=" + data.return[0].dec;
                            $scope.rateTemplate = $scope.templates[1];
                            $scope.template = $scope.templates[0];

                            //var image = "588017567101026437";

                            // Tooltips
                            //$scope.dynamicTooltip = data.return[0].tooltip;
                            $scope.taskExample = data.return[0].tooltip;

                            $rootScope.image = data.return[0].sdss_id;
                            $rootScope.imageUrl =
                                    $scope.onEditChangeResult = "/images/2/crosshair/" + $rootScope.image + ".png";
                            $scope.radioImage = "/images/radio/" + $rootScope.image + ".png";
                            $scope.question = data.return[0].question;

                            $scope.spectras = data.return[0].spectras;

                            $scope.coordinatesId = data.return[0].sdss_id;
                            $rootScope.coordinatesId = data.return[0].sdss_id;
                            $scope.questionId = data.return[0].question_id;

                            $rootScope.isRated = data.options[0].is_rated;
                            $rootScope.radioValue = data.options[0].preset; 
                            
                            $scope.coordinateRa = data.return[0].ra;
                            $scope.coordinateDec = data.return[0].dec;
                            
                            $scope.completedImages = data.statistics[0].completed;
                            $scope.completedImagesPercent = data.statistics[0].completed;
                            
                            if($rootScope.radioValue !== "sdss") {        
                                $rootScope.changeHandler(2, '', $rootScope.radioValue);
                            };
                            
                            // Lightbox
                            $scope.images = [
                                {
                                    'url': "/images/1/" + $rootScope.image + ".png",
                                    'caption': "You can also change the shown picture with your Arrow Keys"
                                },
                                {
                                    'url': "/images/2/" + $rootScope.image + ".png",
                                    'caption': "You can also change the shown picture with your Arrow Keys"
                                },
                                {
                                    'url': "/images/3/" + $rootScope.image + ".png",
                                    'caption': "You can also change the shown picture with your Arrow Keys"
                                },
                                {
                                    'url': "/images/4/" + $rootScope.image + ".png",
                                    'caption': "You can also change the shown picture with your Arrow Keys"
                                },
                                {
                                    'url': "/images/5/" + $rootScope.image + ".png",
                                    'caption': "You can also change the shown picture with your Arrow Keys"
                                },
                                {
                                    'url': "/images/6/" + $rootScope.image + ".png",
                                    'caption': "You can also change the shown picture with your Arrow Keys"
                                },
                                {
                                    'url': "/images/7/" + $rootScope.image + ".png",
                                    'caption': "You can also change the shown picture with your Arrow Keys"
                                },
                                {
                                    'url': "/images/8/" + $rootScope.image + ".png",
                                    'caption': "You can also change the shown picture with your Arrow Keys"
                                }
                            ];

                            $rootScope.openLightboxModal = function (images) {
                                Lightbox.openModal(images, 1);
                            };


                        }).
                        error(function (data, status, headers, config) {
                            // called asynchronously if an error occurs
                            // or server returns response with an error status.
                        });
/*
            });
*/
});

app.controller('introCtrl', function HomeController($scope, store, $templateCache) {


    $templateCache.put('ng-joyride-title.html',
            "<div id=\"ng-joyride-title-tplv1\"><div class=\"ng-joyride sharp-borders intro-banner\" style=\"\"><div class=\"popover-inner\"><h3 class=\"popover-title sharp-borders\">{{heading}}</h3><div class=\"popover-content container-fluid\"><div ng-bind-html=\"content\"></div><hr><div class=\"row\"><div class=\"col-md-4 skip-class\"><a class=\"skipBtn pull-left\" type=\"button\"><i class=\"glyphicon glyphicon-ban-circle\"></i>&nbsp;Cancel</a></div><div class=\"col-md-8\"><div class=\"pull-right\"><button class=\"prevBtn btn\" type=\"button\"><i class=\"glyphicon glyphicon-chevron-left\"></i>&nbsp;Previous</button> <button id=\"nextTitleBtn\" class=\"nextBtn btn btn-primary\" type=\"button\">Next&nbsp;<i class=\"glyphicon glyphicon-chevron-right\"></i></button></div></div></div></div></div></div></div>"
            );

    // Joyride
    function elementTourTemplate(content, isEnd) {
        return '<div class=\"row custom-color\">' +
                '<div id=\"pop-over-text\" class=\"col-md-12\">' +
                content +
                '</div>' +
                '</div>' +
                '<hr>' +
                '<div class=\"row custom-bg\">' +
                '<div class=\"col-md-4 center\">' +
                '<a class=\"skipBtn pull-left\" type=\"button\">Cancel</a>' +
                '</div>' +
                '<div class=\"col-md-8\">' +
                '<div class=\"pull-right\">' +
                '<button id=\"prevBtn\" class=\"prevBtn btn btn-xs\" type=\"button\">Previous</button>' +
                ' <button id=\"nextBtn\" class=\"nextBtn btn btn-xs btn-primary\" type=\"button\">' +
                'Next&nbsp;<i class=\"glyphicon glyphicon-chevron-right\"></button>' +
                '</div>' +
                '</div>' +
                '</div>';
    }

    $scope.config = [
        {
            type: "title",
            heading: "Welcome to Blackhole Chaser",
            text: '<div class="row"><div id="title-text" class="col-md-12"><span class="main-text">Welcome to <strong>Blackhole Chaser</strong></span><br><span>This little introduction should help you to understand how to use the given tools</span></div></div>',
            titleTemplate: "ng-joyride-title.html"
        }, {
            type: "element",
            selector: "#picture",
            heading: "The Subject Galaxy",
            text: "This is the current Galaxy to inspect, you can click on it to get a bigger image",
            placement: "right",
            scroll: true,
            elementTemplate: elementTourTemplate
        }, {
            type: "element",
            selector: "#task",
            heading: "The Task",
            text: "This is the current task, depending on your answer the next Galaxy or Task will be shown",
            placement: "left",
            scroll: true,
            elementTemplate: elementTourTemplate
        }, {
            type: "element",
            selector: "#tools_zoom",
            heading: "Tools - Zoom",
            text: "With this slider you can zoom in and out the picture",
            placement: "left",
            scroll: true,
            elementTemplate: elementTourTemplate,
        }, {
            type: "element",
            selector: "#tools_style",
            heading: "Tools - Style",
            text: "To get more posibilities, you can select a display style here",
            placement: "left",
            scroll: true,
            elementTemplate: elementTourTemplate,
        }, {
            type: "element",
            selector: "#tools_spectra",
            heading: "Tools - Spectra",
            text: "If you have to define <broad spikes> please have a look at the spectras here which are showing you the diagram",
            placement: "left",
            scroll: true,
            elementTemplate: elementTourTemplate,
        },  {
            type: "element",
            selector: "#tools_spectra_click",
            heading: "Tools - Spectra(2)",
            text: "By clicking here you should see the spectra",
            placement: "left",
            scroll: true,
            elementTemplate: elementTourTemplate,
        },  {
            type: "element",
            selector: "#tools_rating",
            heading: "Tools - Rating",
            text: "If you see something interesting, please let us know with a rating",
            placement: "left",
            scroll: true,
            elementTemplate: elementTourTemplate,
        }, {
            type: "element",
            selector: "#contact",
            heading: "Contact",
            text: "Do you have a question, or something is not working - we are glad to help",
            placement: "bottom",
            scroll: true,
            elementTemplate: elementTourTemplate,
        }, {
            type: "element",
            selector: "#finish",
            heading: "Thank you!",
            text: "We wish you good luck and lots of new interesting galaxies",
            placement: "top",
            scroll: true,
            elementTemplate: elementTourTemplate,
        }

    ];

    $scope.start = function () {
        $scope.startJoyRide = true;
    };

    $scope.dismissBanner = function () {
        store.set('dismiss', true);
    };
});
