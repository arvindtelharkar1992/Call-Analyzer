var Twit = require('twit');
var myLocation= '#'+process.argv[2];
var num= process.argv[3];
var myUnityId="#id_adtelhar";
var myId=myUnityId+"_"+num;
var checkInContent='I checked in at '+myLocation+' '+myId+' #P2CSC555F15';
var silent=0;
var loud=0;

//by default we set the expected modes to loud. The same is true for my mode
//These values for the modes can be updated as and when we receive information regarding the noise level
var expectedMode='Loud';
var myMode='Loud';

var callNum=1;

var T = new Twit({
 consumer_key:'L1HSHu3Svaov1JxHDR5spcIME',
 consumer_secret:'zgyrL0QbVpDWeze27iIphuLhb5Qyrk5Ofm6rkFbBzI5yr3Zw0x',
 access_token:'463048531-5qHfvxknt7qmBtyYTPjw05nkLjOjfbZ2iUYVcLGd',
 access_token_secret:'8hJLDSmESouF5jKslmZ9XNfF09TzNSfqwXqrzhNqp35ZO'
});

//Posting a tweet(Check-In)

T.post('statuses/update', { status: checkInContent }, function(err, data, response) {
  console.log('checked in!');
})

//posting tweet for accepting calls 30 seconds after checking In.
setTimeout(function(){
T.post('statuses/update', { status: 'CALL '+myId+' #P2CSC555F15' }, function(err, data, response) {
  console.log(data);
});
},30000);

//Listen for tweets on the hashtag #P2CSC555F15
var stream = T.stream('statuses/filter', { track: '#P2CSC555F15', language: 'en' })
 
stream.on('tweet', function (tweet) {
var tweetContent=tweet.text;
console.log("Latest tweet: "+tweetContent);
var linesOftweet=tweetContent.split('\n');

 //Monitor Check Ins
  if(tweetContent.indexOf('I checked in at')!=-1)  //normal check in by someone
  {
  	var checkInToken=tweetContent.split(' ');
  	var location=checkInToken[4];  //since location is at that position
    var checkInPersonUnityId=checkInToken[5];

    if(tweetContent.indexOf(myUnityId)==-1)  //someone else's checkin
    {
       //Now check whether the checkIn location is the same as my location
      if(location==myLocation)
      {    
        var checkInResponse='@adtelhar\nName: Arvind\nMY_MODE: '+myMode+'\nEXPECTED_MODE: '+expectedMode+'\n'+checkInPersonUnityId+' #P2CSC555F15';
        T.post('statuses/update', { status: checkInResponse }, function(err, data, response) {
        //console.log(data);
          })
      }
    }
    else
    {
    	console.log('I myself checked In');
    }
  }//end monitor checkins

else if((tweetContent.indexOf("EXPECTED_MODE")!=-1) && (tweetContent.indexOf(myId)!=-1))
  {
     console.log("Entering elseif for expectedMode");
     var lines=tweetContent.split('\n');  //split on lines
     var expectedContents=lines[3];
     var expectedValues=expectedContents.split(' ');
     var expectedModeValue=expectedValues[1];     
     if((expectedModeValue.toLowerCase())=="silent")
      silent=silent+1;
     if((expectedModeValue.toLowerCase())=="loud")
      loud=loud+1;
     if(silent>loud)
     {
       expectedMode='Silent';
       myMode='Silent'
       console.log('modes set to '+expectedMode);
     }
     else
     {
       expectedMode='Loud';
       myMode='Loud';
       console.log('modes set to '+expectedMode);
     }
 }
 
 else if((tweetContent.indexOf("URGENCY")!=-1) && (tweetContent.indexOf(myUnityId)!=-1))
  {
     console.log("You are receiving a Call");
     var lines=tweetContent.split('\n');  //split on lines
     var urgencyContents=lines[2];
     var urgencyValues=urgencyContents.split(' ');
     var urgency=urgencyValues[1];     
     console.log('The urgency values is '+urgency);
     var callResponse='';
     if((urgency=='1') || (expectedMode=='Loud'))
     {
       //callResponse='ACTION: Yes '+myId+' #P2CSC555F15';
       callResponse='ACTION: Yes '+myId+'_'+callNum+' #P2CSC555F15';
     }
     else
     {
       //callResponse='ACTION: No '+myId+' #P2CSC555F15';
       callResponse='ACTION: No '+myId+'_'+callNum+' #P2CSC555F15';
     }

     callNum=callNum+1;

    T.post('statuses/update', { status: callResponse }, function(err, data, response) {
      console.log(data);
    });
 }

else if(tweetContent.indexOf("ACTION")!=-1) //Someone has responded to a call with a Yes/No answer
 {
  if(tweetContent.indexOf(myUnityId)==-1)  //making sure that it is not my own action response to a call
  {
   var myResponseToNeighborCall='';
   var neighborResponse=tweetContent.split(' ');
   var response=neighborResponse[1];
   console.log('Neighbor response is '+response);
    
   if((expectedMode=='Silent' && response=='No') || (expectedMode=='Loud' && response=='Yes'))
     myResponseToNeighborCall='@adtelhar\nRESPONSE: Positive\n'+myId+'_'+callNum+' #P2CSC555F15';
   else if(loud==silent || (expectedMode=='Loud' && response=='No')) 
     myResponseToNeighborCall='@adtelhar\nRESPONSE: Neutral\n'+myId+'_'+callNum+' #P2CSC555F15';
   else
     myResponseToNeighborCall='@adtelhar\nRESPONSE: Negative\n'+myId+'_'+callNum+' #P2CSC555F15';

     T.post('statuses/update', { status: myResponseToNeighborCall }, function(err, data, response) {
        //console.log(data);
          })
   }
 }
 else
 {
  console.log('Normal Tweet');
 }
})
