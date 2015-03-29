Visitors = new Mongo.Collection('visitors');

if (Meteor.isClient) {
  Template.signin.helpers({
    vistor: function () {
      return Visitors.find();
    }
  });

  Template.signin.events({
    'click .signinButton, keyup .email': function(e) {
      if ((e.type === 'click') || (e.type === 'keyup' && e.which === 13) ) {
        var email = $('.email').val();
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
        } else {
          $('.overlay').removeClass('hidden');
          $('.emailInput').val($('.email').val());
          $('.firstNameInput').focus();
        }
        $('.email').val('');
        e.preventDefault();
      }
    }
  });

  Template.signup.events({
    'click .signupButton': function() {
      var email = $('.emailInput').val();
      var firstName = $('.firstNameInput').val();
      var lastName = $('.lastNameInput').val();
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
      $('#video').toggleClass('hidden');
      $('#canvas').toggleClass('hidden');
      $('.takePhoto').toggleClass('hidden');
      $('.clearPhoto').toggleClass('hidden');
    },

    'click .closeButton': function() {
      $('.overlay').addClass('animate-reverse').delay(300).queue(function(){
        $(this).addClass('hidden').removeClass('animate-reverse').dequeue();
      });
      $('.welcome').removeClass('hidden');
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

    },
    'click .retake': function() {
        $('#video').toggleClass('hidden');
        $('#canvas').toggleClass('hidden');
    }
  });

}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}