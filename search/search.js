var app = angular.module('pplibdataanalyzer_frontend.search', [
    'ui.router',
    'angular-storage',
    'angular-jwt',
    'bootstrapLightbox',
    'ngJoyRide'
])

        // Url as a trust resource (for urls)
        .filter('trustAsResourceUrl', ['$sce', function ($sce) {
                return function (val) {
                    return $sce.trustAsResourceUrl(val);
                };
            }])

        // trusted filter for html pages
        .filter('to_trusted', ['$sce', function ($sce) {
                return function (text) {
                    return $sce.trustAsHtml(text);
                };
            }])
        .filter('cut', function () {
            return function (input) {
                return input.substring(0, 14);
            };
        })
        // configuration
        .config(function ($stateProvider) {
            $stateProvider.state('search', {
                url: '/search',
                controller: 'initCtrl',
                templateUrl: 'search/search.html',
                data: {
                    requiresLogin: false
                }
            });
        })

        // run controller
        .run(function ($rootScope) {
            $rootScope.image = "";
        })

// search directive
        .directive('errSrc', function () {
            return {
                link: function (scope, element, attrs) {
                    element.bind('error', function () {
                        if (attrs.src != attrs.errSrc) {
                            attrs.$set('src', attrs.errSrc);
                        }
                    });
                }
            };
        })

// rate controller
        .controller('RateCtrl', function RateController($scope, $rootScope, $http, store, jwtHelper, $state, $location) {
            // is it already rated?
            $scope.isRated = $rootScope.isRated;

            // Rating 
            $scope.rate = 0;
            $scope.max = 10;
            $scope.isReadonly = false;
            // hover 
            $scope.hoveringOver = function (value) {
                $scope.overStar = value;
                $scope.percent = 100 * (value / $scope.max);
            };
            // submit function 
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

        })

// search controller
        .controller('SearchCtrl', function SearchController($scope, $rootScope, $http, store, jwtHelper, $state, $location, Lightbox) {

            $scope.toggle = function (spectraId) {
                $scope.currentSpectra = "/images/spectra/" + spectraId + ".png";
            };

            // Event handlers
            $scope.editValue = 2;
            $scope.onEditChange = function () {
                $rootScope.changeHandler($scope.editValue, $scope.radioValue);
            };

            $scope.onRadioChange = function () {

                $rootScope.changeHandler($scope.editValue, $scope.radioValue);
            };


            $rootScope.changeHandler = function (scale, style) {
                $scope.radioValue = style;
                //var image = "588017567101026437";
                if (!scale) {
                    scale = 1;
                }

                if (style === "normal") {
                    style = "crosshair/";
                } else {
                    style = style + "/";
                }
                $scope.onEditChangeResult = "/images/" + scale + "/" + style + $rootScope.image + ".png";
                // Lightbox starter
                $rootScope.openLightboxModal = function (images) {
                    Lightbox.openModal(images, scale - 1);
                };
            };

            // submit function
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
        })

// initalisation controller
        .controller('initCtrl', function InitController($scope, $http, store, $rootScope, Lightbox) {

            if (store.get("ip")) {
                $scope.ipAdress = store.get("ip");
                $rootScope.ipAdress = store.get("ip");
            } else {
                $http.get('http://ipinfo.io/json').
                        success(function (data) {
                            store.set("ip", data.ip);
                            $scope.ipAdress = "data.ip";
                            $rootScope.ipAdress = "data.ip";
                        });
            }
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

            $http.post("/daemon/nextAction", {
                jwt: $scope.jwt,
                ip: $scope.ipAdress
            }).
                    success(function (data, status, headers, config) {

                        if (data == "All tasks are done") {
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

                        if ($rootScope.radioValue !== "sdss") {
                            $rootScope.changeHandler(2, '', $rootScope.radioValue);
                        }
                        ;

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
        })

// A controller for the intro (Joyride)
        .controller('introCtrl', function IntroController($scope, store, $templateCache) {

            // Joyride additional template for customizing
            $templateCache.put('ng-joyride-title.html',
                    "<div id=\"ng-joyride-title-tplv1\"><div class=\"ng-joyride sharp-borders intro-banner\" style=\"\"><div class=\"popover-inner\"><h3 class=\"popover-title sharp-borders\">{{heading}}</h3><div class=\"popover-content container-fluid\"><div ng-bind-html=\"content\"></div><hr><div class=\"row\"><div class=\"col-md-4 skip-class\"><a class=\"skipBtn pull-left\" type=\"button\"><i class=\"glyphicon glyphicon-ban-circle\"></i>&nbsp;Cancel</a></div><div class=\"col-md-8\"><div class=\"pull-right\"><button class=\"prevBtn btn\" type=\"button\"><i class=\"glyphicon glyphicon-chevron-left\"></i>&nbsp;Previous</button> <button id=\"nextTitleBtn\" class=\"nextBtn btn btn-primary\" type=\"button\">Next&nbsp;<i class=\"glyphicon glyphicon-chevron-right\"></i></button></div></div></div></div></div></div></div>"
                    );

            // Joyride element configuration
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

            // Joyride configuration
            $scope.config = [
                {
                    type: "title",
                    heading: "Welcome to Blackhole Chaser",
                    text: '<div class="row"><div id="title-text" class="col-md-12"><span class="main-text">Welcome to <strong>Blackhole Chaser</strong></span><br><span>This little introduction should help you to understand how to use the given tools for a successful classification. Please do not click on anything other than next/orevious or cancel during the tour, you will have enough time to try out everything after the tour.</span></div></div>',
                    titleTemplate: "ng-joyride-title.html"
                }, {
                    type: "element",
                    selector: "#picture",
                    heading: "The Subject Galaxy",
                    text: "This is the current Galaxy-Image to inspect, you can also click on it to get a bigger image.",
                    placement: "right",
                    scroll: true,
                    elementTemplate: elementTourTemplate
                }, {
                    type: "element",
                    selector: "#task",
                    heading: "The Task",
                    text: "This is your current task, depending on your answer the next Galaxy-Image or Task will be shown.",
                    placement: "left",
                    scroll: true,
                    elementTemplate: elementTourTemplate
                }, {
                    type: "element",
                    selector: "#tools_zoom",
                    heading: "Tools - Zoom",
                    text: "With this slider you can zoom-in and zoom-out the Galaxy-Image.",
                    placement: "left",
                    scroll: true,
                    elementTemplate: elementTourTemplate,
                }, {
                    type: "element",
                    selector: "#tools_style",
                    heading: "Tools - Style",
                    text: "To have a deeper insight in the Galaxy-Image, you can select a display style here which may offers you more details about the actual Galaxy-Image.",
                    placement: "left",
                    scroll: true,
                    elementTemplate: elementTourTemplate,
                }, {
                    type: "element",
                    selector: "#tools_spectra",
                    heading: "Tools - Spectra",
                    text: "If you have to define 'broad spikes' please have a look at the spectras here which will show you the according diagram. The topmost Spectra is always the one most centered to the Galaxy-Image.",
                    placement: "left",
                    scroll: true,
                    elementTemplate: elementTourTemplate,
                }, {
                    type: "element",
                    selector: "#tools_spectra_click",
                    heading: "Tools - Spectra(2)",
                    text: "By clicking here you will see the spectra.",
                    placement: "left",
                    scroll: true,
                    elementTemplate: elementTourTemplate,
                }, {
                    type: "element",
                    selector: "#tools_rating",
                    heading: "Tools - Rating",
                    text: "If you see something interesting, please share your experience with us with a rating.",
                    placement: "left",
                    scroll: true,
                    elementTemplate: elementTourTemplate,
                }, {
                    type: "element",
                    selector: "#contact",
                    heading: "Contact",
                    text: "Do you have a question, or something is not working - we are glad to help you.",
                    placement: "bottom",
                    scroll: true,
                    elementTemplate: elementTourTemplate,
                }, {
                    type: "element",
                    selector: "#finish",
                    heading: "Thank you!",
                    text: "We wish you much fun while inspecting lots of Galaxy-Images.",
                    placement: "top",
                    scroll: true,
                    elementTemplate: elementTourTemplate,
                }

            ];

            // Starts the Joyride
            $scope.start = function () {
                $scope.startJoyRide = true;
            };

            // Sets the tour permanently off
            $scope.dismissBanner = function () {
                store.set('dismiss', true);
            };

            $scope.onFinish = function () {
                // We need a reload here, otherways the modal functionality is somehow broken
                window.location.reload(false);
            };
        });
