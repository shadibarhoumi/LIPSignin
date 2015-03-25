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
        Visitors.update
        if (matches.length) { // if user exists
          var visitor = matches[0];
          console.log("found vis: ", visitor);
          // increment number of visits
          Visitors.update(visitor._id, {$inc: {numVisits: 1}});
          visitor = Visitors.find(visitor._id).fetch()[0];
          console.log("updated visitor: ", visitor);
          $(".signinForm").prepend($("</p>").text("Welcome back, " + visitor.email + "! This is visit #" + visitor.numVisits + " for you!"));
        } else {
          // create new user
          Visitors.insert({ 
            email: email,
            numVisits: 1,
            createdAt: new Date()
          });
          $(".signinForm").prepend($("</p>").text("Welcome, " + email + "! This is your first visit."));
        }

        $('.email').val('');
      }
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}