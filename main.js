var Twit = require('twit');

var T = new Twit({
    consumer_key: process.env.TWITTER_CONSUMER_KEY
  , consumer_secret:process.env.TWITTER_CONSUMER_SECRET_KEY
  , access_token:process.env.TWITTER_ACCESS_TOKEN
  , access_token_secret:process.env.TWITTER_TOKEN_SECRET
});

//Posting a tweet(Check-In)
T.post('statuses/update', { status: 'Test Tweet' }, function(err, data, response) {
  console.log(data);
})

var stream = T.stream('statuses/filter', { track: '#apple', language: 'en' })
 
stream.on('tweet', function (tweet) {
  console.log(tweet.text);
})
