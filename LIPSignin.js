Visitors = new Mongo.Collection('visitors');

if (Meteor.isClient) {
  Session.set('canvasCurrent', false);
  // helper functions
  function validateEmail(email) {
    var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
    return re.test(email);
  }

  // template functions
  Template.signin.helpers({
    vistor: function () {
      return Visitors.find();
    }
  });

  Template.signin.events({
    'click .signinButton, keyup .email': function(e) {
      if ((e.type === 'click') || (e.type === 'keyup' && e.which === 13) ) {
        var email = $('.email').val();
        // validate email
        if (validateEmail(email)) {
          // insert visitor into database
          var matches = Visitors.find({email: email}).fetch();
          $('.visitorContainer').remove(); // clear info area of any visitor info
          if (matches.length) { // if user exists
            var visitor = matches[0];
            // increment number of visits
            Visitors.update(visitor._id, {$inc: {numVisits: 1}});
            visitor = Visitors.find(visitor._id).fetch()[0];
            // hide sign in message
            $('.welcome').addClass('hidden');
            var visitorContainer = $('<div>').attr('class', 'visitorContainer animate').appendTo('.infoArea')[0];
            // insert visitor template which greets user
            Blaze.renderWithData(Template.visitorInfo, visitor, visitorContainer);
          } else { // if user doesn't exist
            $('.overlay').removeClass('hidden');
            $('.emailInput').val($('.email').val());
            $('.email').removeClass('form-control-red');
            $('.firstNameInput').focus();
          }
          $('.email').val('');
          $('.email').popover('destroy'); 
          e.preventDefault();
        } else {
          $('.email').popover({animation: true,
                              container: '.signinForm',
                              placement: 'top',
                              trigger: 'focus', 
                              title: "Whoops!", content: "Please enter a valid email!" });
          $('.email').popover('show');
          $('.email').addClass('form-control-red');
        }
      }
    }
  });

  Template.signup.events({
    'click .signupButton': function() {
        var email = $('.emailInput').val();
        var firstName = $('.firstNameInput').val();
        var lastName = $('.lastNameInput').val();
        // validate presence of email, first name, last name
        if (!email || !validateEmail(email)) {
          $('.emailInput').popover({animation: true,
                            container: '.signupForm',
                            placement: 'bottom',
                            trigger: 'focus',
                            title: "Whoops!", content: "Please enter a valid email!" });
          $('.emailInput').popover('show');
          $('.emailInput').addClass('form-control-red');
        } else if (!firstName) {
          $('.firstNameInput').popover({animation: true,
                            container: '.signupForm',
                            placement: 'top',
                            trigger: 'focus',
                            title: "Whoops!", content: "Enter your first name!" });
          $('.firstNameInput').popover('show');
          $('.firstNameInput').addClass('form-control-red');
        } else if (!lastName) {
          $('.lastNameInput').popover({animation: true,
                            container: '.signupForm',
                            placement: 'top',
                            trigger: 'focus',
                            title: "Whoops!", content: "Enter your last name!" });
          $('.lastNameInput').popover('show');
          $('.lastNameInput').addClass('form-control-red');
        } else if (!validateEmail(email)) {
          $('.emailInput').popover({animation: true,
                            container: '.signupForm',
                            placement: 'bottom',
                            trigger: 'focus',
                            title: "Whoops!", content: "Please enter a valid email!" });
          $('.emailInput').popover('show');
          $('.emailInput').addClass('form-control-red');
        } else if (!Session.get('canvasCurrent')) {
          $('.videoContainer').popover({animation: true,
                    container: '.photoModal',
                    placement: 'left',
                    trigger: 'manual',
                    title: "Whoops!", content: "Take a photo of yourself!" });
          $('.videoContainer').popover('show');
        } else {
          // store photo
          var imageURL = document.getElementById("canvas").toDataURL();
          // create new user
          var visitorId = Visitors.insert({ 
            firstName: firstName,
            lastName: lastName,
            email: email,
            numVisits: 1,
            photo: imageURL,
            createdAt: new Date()
          });
          var visitor = Visitors.find(visitorId).fetch()[0];
          // hide sign in message
          $('.welcome').addClass('hidden');
          $('.overlay').addClass('hidden');
          var visitorContainer = $('<div>').attr('class', 'visitorContainer animate').appendTo('.infoArea')[0];
          // insert visitor template which greets user
          Blaze.renderWithData(Template.visitorInfo, visitor, visitorContainer);

          // clear form fields
          $('.emailInput').val('');
          $('.firstNameInput').val('');
          $('.lastNameInput').val('');
          $('#video').removeClass('hidden');
          $('#canvas').addClass('hidden');
          $('.takePhoto').removeClass('hidden');
          $('.clearPhoto').addClass('hidden');
          Session.set('canvasCurrent', false); // image stored in canvas is now an old one
          $('.videoContainer').popover('destroy');
          $('.emailInput').popover('destroy');
          $('.firstNameInput').popover('destroy');
          $('.lastNameInput').popover('destroy');
        }
    },

    'click .closeButton': function() {
      $('.overlay').addClass('animate-reverse').delay(300).queue(function(){
        $(this).addClass('hidden').removeClass('animate-reverse').dequeue();
      });
      $('.welcome').removeClass('hidden');
      // clear form fields
      $('.emailInput').val('');
      $('.firstNameInput').val('');
      $('.lastNameInput').val('');
      $('#video').removeClass('hidden');
      $('#canvas').addClass('hidden');
      $('.takePhoto').removeClass('hidden');
      $('.clearPhoto').addClass('hidden');
    }
  });

  Template.photo.rendered = function() {
    var canvas = document.getElementById("canvas"),
        context = canvas.getContext("2d"),
        video = document.getElementById("video"),
        videoObj = { "video": true },
        errBack = function(error) {
          console.log("Video capture error: ", error.code); 
        };

    // Put video listeners into place
    if(navigator.getUserMedia) { // Standard
      navigator.getUserMedia(videoObj, function(stream) {
        video.src = stream;
        video.play();
      }, errBack);
    } else if(navigator.webkitGetUserMedia) { // WebKit-prefixed
      navigator.webkitGetUserMedia(videoObj, function(stream){
        video.src = window.webkitURL.createObjectURL(stream);
        video.play();
      }, errBack);
    }
    else if(navigator.mozGetUserMedia) { // Firefox-prefixed
      navigator.mozGetUserMedia(videoObj, function(stream){
        video.src = window.URL.createObjectURL(stream);
        video.play();
      }, errBack);
    }
  };

  Template.photo.events({
    'click .snap': function() { // take photo
        console.log('snapping');
        $('#video').toggleClass('hidden');
        $('#canvas').toggleClass('hidden');
        var canvas = document.getElementById("canvas");
        var context = canvas.getContext("2d");
        var video = document.getElementById("video");
        context.drawImage(video, 0, 0, 400, 300);
        $('.snap').toggleClass('fa-camera');
        $('.snap').toggleClass('fa-times-circle');
        $('.takePhoto').toggleClass('hidden');
        $('.clearPhoto').toggleClass('hidden');
        if (Session.get('canvasCurrent')) { // "retake"
          Session.set('canvasCurrent', false);
        } else { // "take photo"
          Session.set('canvasCurrent', true);
        }
        $('.videoContainer').popover('destroy');
    }
  });

}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}