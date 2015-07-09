angular.module('pplibdataanalyzer_frontend.search', [
  'ui.router',
  'angular-storage',
  'angular-jwt',
    'bootstrapLightbox',
    'ngJoyRide'
])

.filter('trustAsResourceUrl', ['$sce', function ($sce) {
    return function (val) {
        return $sce.trustAsResourceUrl(val);
    }
    }])


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
    .run(function ($rootScope) {
        $rootScope.image = "";
    })

.controller('SearchCtrl', function HomeController($scope, $rootScope, $http, store, jwtHelper, $state) {

    // Rating 
    $scope.rate = 7;
    $scope.max = 10;
    $scope.isReadonly = false;

    $scope.hoveringOver = function (value) {
        $scope.overStar = value;
        $scope.percent = 100 * (value / $scope.max);
    };

    // Event handlers
    $scope.onEditChange = function () {
        $scope.changeHandler($scope.editValue, '', $scope.radioValue);
    };

    $scope.onCheckBoxChange = function () {
        var test = 2;
        if ($scope.check1Selected) {
            test = 3;
        }

        $scope.changeHandler('', test, '');
    };

    $scope.onRadioChange = function () {

        $scope.changeHandler($scope.editValue, '', $scope.radioValue);
    };


    $scope.changeHandler = function (test, test2, test3) {
        //var image = "588017567101026437";
        if (!test) {
            test = 7;
        }

        if (test3 == "normal") {
            test3 = "small/";
        } else {
            test3 = test3 + "/";
        }
        $scope.onEditChangeResult = "/images/" + test + "/" + test3 + $rootScope.image + ".png";
    };


    $scope.submit = function () {



        var msg = {
            uuid: store.get('jwt'),
            coordinates_id: this.coordinatesId,
            question_id: parseInt(this.questionId),
            answer: this.quest,
            ip: this.ipAdress
        };
        console.log(angular.toJson(msg));
        $http.post('/tasklog', angular.toJson(msg)).
        success(function (data, status, headers, config) {
            // this callback will be called asynchronously
            // when the response is available
        }).
        error(function (data, status, headers, config) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
        }).then(function (response) {
            window.location.reload(false);

        });



    };

})

.controller('initCtrl', function HomeController($scope, $http, store, jwtHelper, $rootScope, Lightbox) {

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

    $http.get('http://ipinfo.io/json').
    success(function (data) {


        $scope.ipAdress = data.ip;
        $http.post("/daemon/nextAction", {
            jwt: $scope.jwt,
            ip: data.ip
        }).
        success(function (data, status, headers, config) {
            $scope.action = data;

            // iframe
            $scope.sdssUrl = "http://skyserver.sdss.org/dr7/en/tools/explore/obj.asp?ra=" + data.return[0].ra + "&dec=" + data.return[0].dec;
            if (data.return[0].answer == 'Rating') {
                $scope.template = $scope.templates[1];
            } else {
                $scope.template = $scope.templates[0];
            }
            //var image = "588017567101026437";

            // Tooltips
            $scope.dynamicTooltip = data.return[0].tooltip;

            $rootScope.image = data.return[0].sdss_id;
            $rootScope.imageUrl =

                $scope.onEditChangeResult = "/images/7/small/" + $rootScope.image + ".png";
            $scope.question = data.return[0].question;

            $scope.coordinatesId = data.return[0].sdss_id;
            $scope.questionId = data.return[0].question_id;

            // Lightbox
            $scope.images = [
                {
                    'url': "/images/7/" + $rootScope.image + ".png",
                    'caption': "You can also change the shown picture with your Arrow Keys"
                            },
                {
                    'url': "/images/8/" + $rootScope.image + ".png"
                            },
                {
                    'url': "/images/9/" + $rootScope.image + ".png"
                    
                            },
                {
                    'url': "/images/10/" + $rootScope.image + ".png"
                            },
                {
                    'url': "/images/11/" + $rootScope.image + ".png"
                            },
                {
                    'url': "/images/12/" + $rootScope.image + ".png"
                            },
                {
                    'url': "/images/13/" + $rootScope.image + ".png"
                            },
            ];

            $scope.openLightboxModal = function (images) {
                Lightbox.openModal(images, 0);
            };


        }).
        error(function (data, status, headers, config) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
        });

    });

})




.controller('introCtrl', function HomeController($scope, store) {


    // Joyride


    $scope.config = [
        {
            type: "title",
            heading: "Welcome to Blackhole Chaser",
            text: '<div class="row"><div id="title-text" class="col-md-12"><span class="main-text">Welcome to <strong>Blackhole Chaser</strong></span><br><span>This little introduction should help you to understand how to use the given tools</span></div></div>',
            elementTemplate: function (content, isEnd) {
                //The joyride will invoke this function while rendering this element.
                //Content : The "text" to be shown in the element.
                //isEnd: Signifying if this is the end of the joyride so that you can style it differently.
                var template =
                    '<div class=\"row custom-color\">' +
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
                    'Next&nbsp;<i class=\"glyphicon glyphicon-chevron-right\">'
                '</button>' +
                '</div>' +
                '</div>' +
                '</div>';
                return template;
            }
            }, {
            type: "element",
            selector: "#picture",
            heading: "The Subject Galaxy",
            text: "This is the current Galaxy to inspect, you can click on it to get a bigger image",
            placement: "right",
            scroll: true,
            elementTemplate: function (content, isEnd) {
                //The joyride will invoke this function while rendering this element.
                //Content : The "text" to be shown in the element.
                //isEnd: Signifying if this is the end of the joyride so that you can style it differently.
                var template =
                    '<div class=\"row custom-color\">' +
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
                    'Next&nbsp;<i class=\"glyphicon glyphicon-chevron-right\">'
                '</button>' +
                '</div>' +
                '</div>' +
                '</div>';
                return template;
            }
            }, {
            type: "element",
            selector: "#task",
            heading: "The Task",
            text: "This is the current task, depending on your answer the next Galaxy or Task will be shown",
            placement: "left",
            scroll: true,
            elementTemplate: function (content, isEnd) {
                //The joyride will invoke this function while rendering this element.
                //Content : The "text" to be shown in the element.
                //isEnd: Signifying if this is the end of the joyride so that you can style it differently.
                var template =
                    '<div class=\"row custom-color\">' +
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
                    'Next&nbsp;<i class=\"glyphicon glyphicon-chevron-right\">'
                '</button>' +
                '</div>' +
                '</div>' +
                '</div>';
                return template;
            }
            }, {
            type: "element",
            selector: "#tools_zoom",
            heading: "Tools - Zoom",
            text: "With this slider you can zoom in and out the picture",
            placement: "left",
            scroll: true,
            elementTemplate: function (content, isEnd) {
                //The joyride will invoke this function while rendering this element.
                //Content : The "text" to be shown in the element.
                //isEnd: Signifying if this is the end of the joyride so that you can style it differently.
                var template =
                    '<div class=\"row custom-color\">' +
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
                    'Next&nbsp;<i class=\"glyphicon glyphicon-chevron-right\">'
                '</button>' +
                '</div>' +
                '</div>' +
                '</div>';
                return template;
            }
            }, {
            type: "element",
            selector: "#tools_style",
            heading: "Tools - Style",
            text: "To get more posibilities, you can select a display style here",
            placement: "left",
            scroll: true,
            elementTemplate: function (content, isEnd) {
                //The joyride will invoke this function while rendering this element.
                //Content : The "text" to be shown in the element.
                //isEnd: Signifying if this is the end of the joyride so that you can style it differently.
                var template =
                    '<div class=\"row custom-color\">' +
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
                    'Next&nbsp;<i class=\"glyphicon glyphicon-chevron-right\">'
                '</button>' +
                '</div>' +
                '</div>' +
                '</div>';
                return template;
            }
            }, {
            type: "element",
            selector: "#contact",
            heading: "Contact",
            text: "Do you have a question, or something is not working - we are glad to help",
            placement: "bottom",
            scroll: true,
            elementTemplate: function (content, isEnd) {
                //The joyride will invoke this function while rendering this element.
                //Content : The "text" to be shown in the element.
                //isEnd: Signifying if this is the end of the joyride so that you can style it differently.
                var template =
                    '<div class=\"row custom-color\">' +
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
                    'Next&nbsp;<i class=\"glyphicon glyphicon-chevron-right\">'
                '</button>' +
                '</div>' +
                '</div>' +
                '</div>';
                return template;
            }
            }, {
            type: "element",
            selector: "#finish",
            heading: "Thank you!",
            text: "We wish you good luck and lots of new interesting galaxies",
            placement: "top",
            scroll: true,
            elementTemplate: function (content, isEnd) {
                //The joyride will invoke this function while rendering this element.
                //Content : The "text" to be shown in the element.
                //isEnd: Signifying if this is the end of the joyride so that you can style it differently.
                var template =
                    '<div class=\"row custom-color\">' +
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
                    'Next&nbsp;<i class=\"glyphicon glyphicon-chevron-right\">'
                '</button>' +
                '</div>' +
                '</div>' +
                '</div>';
                return template;
            }
            }

        ];

    $scope.start = function () {
        $scope.startJoyRide = true;
    }

    $scope.dismissBanner = function () {
        store.set('dismiss', true);
    }
});
