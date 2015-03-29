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
          // store photo
          var imageURL = document.getElementById("canvas").toDataURL();
          // create new user
          Visitors.insert({ 
            email: email,
            numVisits: 1,
            photo: imageURL,
            createdAt: new Date()
          });
          $(".signinForm").prepend($("</p>").text("Welcome, " + email + "! This is your first visit."));
        }
        $('.email').val('');
        e.preventDefault();
      }
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
    'click #snap': function() { // take photo
        $('#video').toggleClass('hidden');
        $('#canvas').toggleClass('hidden');
        var canvas = document.getElementById("canvas");
        var context = canvas.getContext("2d");
        var video = document.getElementById("video");
        context.drawImage(video, 0, 0, 640, 480);
        $('.retake').removeClass('hidden');
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