/**
 * Created by gilles on 29.12.2015.
 */

if(!GDT || !GDT.Core) throw new Error("EventCollision needs GDTCore to run");

GDT.EC = {};

GDT.EC.events = {};
GDT.EC.eventnames = {};
GDT.EC.eventValues = {};
GDT.EC.eventsFullfilled = {};

GDT.EC.update = function(events) {
  GDT.EC.events = {};
  GDT.EC.eventValues = {};
  GDT.EC.eventnames = {};
  events.forEach(function(event) {
    var note = $dataMap.events[event._eventId].note;
    //if(note == "") return true;
    var tagValue = GDT.Core.parseTag(note,"EC",event);
    //if(tagValue == false) return true;


    // EventCollision was used
    var name = $dataMap.events[event._eventId].name;
    if(GDT.Core.hasInvalidValues(name)) return true;


    GDT.EC.eventnames[event._eventId] = $dataMap.events[event._eventId].name;
    GDT.EC.events[name] = event;
    GDT.EC.eventValues[event._eventId] = tagValue;
  });
};



GDT.EC.checkEvent = function(event) {
  //var name = GDT.EC.eventnames[event._eventId];
 // if(!name) return false;
  var note = $dataMap.events[event._eventId].note;

  //console.debug("Event!", event, name);
  var tagValues = GDT.Core.getTagValues(note,"EC", event);
  if(tagValues == false) return true;

  var otherEventNames = tagValues[0];
  otherEventNames = otherEventNames.split(",");
  var processExpression = tagValues[1];

  var doProcess = false;
  for(var i=0; i < otherEventNames.length; i++) {
    var oevtn = otherEventNames[i];
    if(GDT.EC.events[oevtn]) {
      var sameCoords = GDT.EC.eventsOnSameLevel(event,GDT.EC.events[oevtn]);
      if(sameCoords) {
        doProcess = true;
        break;
      }
    }
  }

  if(doProcess && !GDT.EC.eventsFullfilled[event._eventId]) {
    GDT.EC.eventsFullfilled[event._eventId] = true;
    GDT.Core.processExpression(processExpression, event);
  } else if(!doProcess){
    //GDT.EC.eventsFullfilled[name] = false;
  }
};

GDT.EC.eventsOnSameLevel = function(evt1, evt2) {
  if(!evt1 || !evt2) return false;
  if(!evt1 ||evt1._x != evt2._x) return false;
  return evt1._y == evt2._y;
};




GDT.EC.hasSameCoordinates = function(compareEvent1, compareEvent2, switchNumber) {
  var sameLevel = false;

  if(!switchNumber) {
    switchNumber = compareEvent2;
    compareEvent2 = compareEvent1;
    compareEvent1 = $dataMap.events[this._eventId].name;
  }

  var evt = GDT.EC.events[compareEvent1];
  compareEvent2 = compareEvent2.split(",");
  for(var i=0; i < compareEvent2.length; i++) {
    var oe = GDT.EC.events[compareEvent2[i]];
    if(GDT.EC.eventsOnSameLevel(evt, oe)) {
      sameLevel = true;
      break;
    }
  }
  $gameSwitches.setValue(switchNumber, sameLevel);
};


(function() {

  var _Game_Interpreter_pluginCommand =
    Game_Interpreter.prototype.pluginCommand;
  Game_Interpreter.prototype.pluginCommand = function(command, args) {
    _Game_Interpreter_pluginCommand.call(this, command, args);
    if (command === 'GDT_EC') {
      switch (args[0]) {
        case 'same':
          //console.debug("same");
          GDT.EC.hasSameCoordinates.apply(this, args.splice(1));
          break;
      }
    }
  };



  var _Game_Event_update = Game_Event.prototype.update;
  Game_Event.prototype.update = function() {
    GDT.EC.checkEvent(this);
    _Game_Event_update.call(this);
  };

  var _Game_Map_updateEvents = Game_Map.prototype.updateEvents;
  Game_Map.prototype.updateEvents = function() {
    GDT.EC.update(this.events());

    _Game_Map_updateEvents.call(this);

  };

})();
