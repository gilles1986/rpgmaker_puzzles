/**
 * Created by gilles on 29.12.2015.
 */
GDT = {};
GDT.Core = {
  version : "1.0"
};

GDT.Core.hasInvalidValues = function(value) {
  var invalidValues = ",:><".split("");
  for(var i =0; i < invalidValues.length; i++) {
    var ivc = invalidValues[i];
    if(value.indexOf(ivc) >= 0) {
      console.error("value: "+value+" has illegal characters. Illegal is ,:><");
      return true;
    }
  }
  return false;
};

GDT.Core.getTagValues = function(note, tag, parseElement) {
  var tagValue = GDT.Core.parseTag(note, tag, parseElement);
  if(tagValue === false) return false;

  var values = tagValue.split(":");
  if(values.length <= 1) {
    return tagValue;
  }

  return values;
};

GDT.Core.processExpression = function(expr, evt) {
  if(expr.indexOf("V") == 0) {
    GDT.Core.processVariable(expr);
  } else if(expr.indexOf("S") == 0) {
    GDT.Core.processSwitch(expr);
  } else {
    GDT.Core.processSelfSwitch(expr, evt);
  }

};

GDT.Core.processVariable = function(expr) {
  var varValue = expr.substr(1);
  var op = GDT.Core._processVariableOperator(expr);
  if(!op) return true;

  var key = varValue.split(op)[0];
  var value = parseInt(varValue.split(op)[1],10);
  var newValue = $gameVariables.value(key);

  if(op == "=") {
    newValue = value;
  } else if(op == "+") {
    newValue += value;
  } else if(op == "-") {
    newValue -= value;
  } else if(op == "*") {
    newValue *= value;
  } else if(op == "/") {
    newValue /= value;
  }

  $gameVariables.setValue(key, newValue);

};

GDT.Core._processVariableOperator = function(expr) {
  var operatorArr = "=+-/*".split("");

  var op = false;
  for(var i=0; i < operatorArr.length; i++) {
    if(expr.indexOf(operatorArr[i]) >= 0) {
      op = operatorArr[i];
      break;
    }
  }
  return op;
};

GDT.Core.processSwitch = function(expr) {
  var switchNumberArr =  expr.substr(1).split("=");
  var switchNumber = switchNumberArr[0];
  var switchNumberValue = (switchNumberArr.length > 1) ? ((switchNumberArr[1].toLowerCase() == "on") ? true : false) : true;

  $gameSwitches.setValue(switchNumber, switchNumberValue);
};

GDT.Core.processSelfSwitch = function(expr, evt) {
  var char =  expr.substr(0,1);
  var exprArr = expr.split("=");
  var charValue = (exprArr.length > 1 && exprArr[1].toLocaleLowerCase() == "on") ? true : false;

  var key = [$gameMap._mapId, evt._eventId, char];
  $gameSelfSwitches.setValue(key, charValue);

};


GDT.Core.parseTag = function(note, tag, parseElement) {
  var searchString = "<GDT:"+tag+":";
  var start = note.indexOf(searchString);
  if(start < 0) return false;
  var subString = note.substr(start+searchString.length);
  end = subString.indexOf(">");
  if(end < 0) {
    console.error("Config for following object was not correct", parseElement||"No Object given", tag, note);
    return false;
  }

  return subString.substr(0,end).trim();
};