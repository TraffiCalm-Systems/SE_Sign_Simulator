//======================================
//  digit display
//======================================
//#region
var digits =  [ ".########." +
				"##########" +
				"##......##" +
				"##......##" +
				"##......##" +
				"##......##" +
				"##......##" +
				"##......##" +
				"##......##" +
				"##......##" +
				"##......##" +
				"##......##" +
				"##......##" +
				"##......##" +
				"##########" +
				".########.",

				"........##" +
				".......###" +
				"........##" +
				"........##" +
				"........##" +
				"........##" +
				"........##" +
				"........##" +
				"........##" +
				"........##" +
				"........##" +
				"........##" +
				"........##" +
				"........##" +
				"........##" +
				"........##",
				
				".########." +
				".#########" +
				"........##" +
				"........##" +
				"........##" +
				"........##" +
				"........##" +
				".#########" +
				"#########." +
				"##........" +
				"##........" +
				"##........" +
				"##........" +
				"##........" +
				"##########" +
				".#########",
				
				".########." +
				"##########" +
				"........##" +
				"........##" +
				"........##" +
				"........##" +
				"........##" +
				"...######." +
				"...######." +
				"........##" +
				"........##" +
				"........##" +
				"........##" +
				"........##" +
				"##########" +
				".########.",

				"........##" +
				"##......##" +
				"##......##" +
				"##......##" +
				"##......##" +
				"##......##" +
				"##......##" +
				"##########" +
				".#########" +
				"........##" +
				"........##" +
				"........##" +
				"........##" +
				"........##" +
				"........##" +
				"........##",	
				
				"##########" +
				"##########" +
				"##........" +
				"##........" +
				"##........" +
				"##........" +
				"##........" +
				"#########." +
				".#########" +
				"........##" +
				"........##" +
				"........##" +
				"........##" +
				"........##" +
				"##########" +
				".########.",	

				".#######.." +
				"#########." +
				"##........" +
				"##........" +
				"##........" +
				"##........" +
				"##........" +
				"#########." +
				"##########" +
				"##......##" +
				"##......##" +
				"##......##" +
				"##......##" +
				"##......##" +
				"##########" +
				".########.",	
				
				"..########" +
				".#########" +
				"........##" +
				"........##" +
				"........##" +
				"........##" +
				"........##" +
				"........##" +
				"........##" +
				"........##" +
				"........##" +
				"........##" +
				"........##" +
				"........##" +
				"........##" +
				"........##",

				".########." +
				"##########" +
				"##......##" +
				"##......##" +
				"##......##" +
				"##......##" +
				"##......##" +
				".########." +
				".########." +
				"##......##" +
				"##......##" +
				"##......##" +
				"##......##" +
				"##......##" +
				"##########" +
				".########.",
				
				".########." +
				"##########" +
				"##......##" +
				"##......##" +
				"##......##" +
				"##......##" +
				"#.......##" +
				"##########" +
				".#########" +
				"........##" +
				"........##" +
				"........##" +
				"........##" +
				"........##" +
				"........##" +
				"........##"];

function setBulbLit(value)
{
	value.style.fill = "#FFA500";
}

function setBulbDark(value)
{
	value.style.fill = "#1f1f1f";
}

function clearBulbs()
{
	for (let y = 0; y < 16; y++)
	{
		for (let x = 0; x < 20; x++)
		{
			let obj = document.getElementById(getBulbName(x, y));
			if (obj != null)
				setBulbDark(obj);
		}
	}
}

function getBulbName(x, y)
{
	let name = (x + 10).toString(36).toUpperCase() + y.toString();
	return name;
}

function setLeftDigit(value)
{
	for (let y = 0; y < 16; y++)
	{
		for (let x = 0; x < 10; x++)
		{
			let obj = document.getElementById(getBulbName(x, y));
			if (obj != null)
				(digits[value].charAt((10 * y) + x) === '#') ? setBulbLit(obj) : setBulbDark(obj);
		}
	}
}

function setRightDigit(value)
{
	for (let y = 0; y < 16; y++)
	{
		for (let x = 10; x < 20; x++)
		{
			let obj = document.getElementById(getBulbName(x, y));
			if (obj != null)
				(digits[value].charAt((10 * y) + (x - 10)) === '#') ? setBulbLit(obj) : setBulbDark(obj);
		}
	}
}

function setDigits(val)
{
	clearBulbs();
    if (val < 0)
    {
        return;
    }
	
    if (val == 0)
    {
        setRightDigit(0);
        return;
    }

    var digarray = [];
    while (val > 0) 
    {
        digarray.push(val % 10);
        val = parseInt(val / 10);
    }

    if (digarray.length > 0)
    { 
        setRightDigit(digarray[0]);
    } 
    if (digarray.length > 1)
    {
        setLeftDigit(digarray[1]);
    }
}

//#endregion
//======================================
//  sign state
//======================================
//#region
let signState = 
{

	SCHEDULEA:	{ 	
					feedbackPattern: "0000", 
					name: "SCHEDULE: DELAY #1",
					glow: ["btnStepDown", "btnStepUp", "btnVolDown", "btnVolUp", "btnExit"],
					explanation: "This is where you will select the amount of hours that the sign will delay from the current time until it first switches on.",
					nextSteps: "• press the UP or DOWN arrows to set the HOURS OF DELAY.\n• then press the LEFT or RIGHT arrows to start setting the HOURS that the sign will be ON for.\n\n• or press EXIT to cancel.",
					min: 0, 
					max: 23, 
					current: 0, 
					handleinput: function() 
					{
						handlescheduleitem(true);
						updateScheduleExplanation();
						if (signMemory.commandChain.includes("btnVolDown") || signMemory.commandChain.includes("btnVolUp"))
						{
							setSignState(signState.SCHEDULEB);
						}
						else if (signMemory.commandChain.includes("btnExit"))
						{
							setSignState(signState.STANDBY);
						}
					}
					
				},
				
	SCHEDULEB:	{ 	
					feedbackPattern: "0000", 
					name: "SCHEDULE: ON HOURS #1",
					glow: ["btnExit", "btnOk", "btnVolDown", "btnVolUp"],
					explanation: "Now you are selecting the number of hours that the sign will be on for after the first delay.",
					nextSteps: "• press the LEFT or RIGHT arrows to set the number of HOURS the sign will be ON for.\n\nThen you can...\n\n• press OK if you'd like the sign to come on a second time in the 24 hour period.\n\n• or press EXIT to save the schedule and go back to STANDBY mode.\n\nNOTE: If the sign loses power or is switched out of STANDBY mode, the 24 hour schedule will be erased!",
					min: 0, 
					max: 23, 
					current: 0, 
					handleinput: function() 
					{
						handlescheduleitem(false);
						updateScheduleExplanation();
						if (signMemory.commandChain.includes("btnOk"))
						{
							setSignState(signState.SCHEDULEC);
						}
						else if (signMemory.commandChain.includes("btnExit"))
						{
							setSignState(signState.STANDBY);
						}
					}
					
				},
	SCHEDULEC:	{ 	
					feedbackPattern: "0000", 
					name: "SCHEDULE: DELAY #2",
					glow: ["btnExit","btnStepDown", "btnStepUp", "btnVolDown", "btnVolUp"],
					explanation: "Now you are selecting the number of hours that the sign will delay for after it's first ON period.",
					nextSteps: "• press the UP or DOWN arrows to set the HOURS OF THE SECOND DELAY.\n• then press the LEFT or RIGHT arrows to start setting the duration for the SECOND PERIOD OF ACTIVITY.\n\n• or press EXIT to save the schedule as-is and go back to STANDBY mode.\n\nNOTE: If the sign loses power or is switched out of STANDBY mode, the 24 hour schedule will be erased!",
					min: 0, 
					max: 23, 
					current: 0, 
					handleinput: function() 
					{
						handlescheduleitem(true);
						updateScheduleExplanation();
						if (signMemory.commandChain.includes("btnVolDown") || signMemory.commandChain.includes("btnVolUp"))
						{
							setSignState(signState.SCHEDULED);
						}
						else if (signMemory.commandChain.includes("btnExit"))
						{
							setSignState(signState.STANDBY);
						}
					}
					
				},

	SCHEDULED:	{ 	
					feedbackPattern: "0000", 
					name: "SCHEDULE: ON HOURS #2",
					glow: ["btnExit", "btnVolDown", "btnVolUp"],
					explanation: "Now you are selecting the number of hours that the sign will be on for after the second delay.",
					nextSteps: "• press the LEFT or RIGHT arrows to set the number of HOURS the sign will be ON for.\n\n• press EXIT to save the schedule and go back to STANDBY mode.\n\nNOTE: If the sign loses power or is switched out of STANDBY mode, the 24 hour schedule will be erased!",
					min: 0, 
					max: 23, 
					current: 0, 
					handleinput: function() 
					{
						handlescheduleitem(false);
						updateScheduleExplanation();
						if (signMemory.commandChain.includes("btnVolDown") || signMemory.commandChain.includes("btnVolUp"))
						{
							setSignState(signState.SCHEDULED);
						}
						else if (signMemory.commandChain.includes("btnExit"))
						{
							setSignState(signState.STANDBY);
						}
					}
					
				},

	LOCKED: 	{ 	
					feedbackPattern: "0000", 
					name: "LOCKED",
					glow: ["btnSign","btnExit", "btnOk"],
					explanation: "The sign is locked and operating normally.",
					nextSteps: "• press SIGN\n• then EXIT\n• then OK\n\nTo unlock the sign.",
					handleinput: function() 
					{
						if (signMemory.commandChain.includes("btnSignbtnExitbtnOk"))
						{
							setSignState(signState.PASSKEY);
						}
					}
					
				},
	
	PASSKEY: 	{ 
					feedbackPattern: "1001", 
					name: "PASSCODE ENTRY", 
					glow: ["btnExit","btn0", "btn1", "btn2", "btn3", "btn4", "btn5", "btn6", "btn7", "btn8", "btn9" ],
					explanation: "You now have several seconds to enter the 5 digit passcode.\n\n• The status pattern LED will jump down one place if the digit entered is correct.\n\n• If you enter a digit incorrectly, the sign will be returned to a LOCKED state.",
					nextSteps: "• enter the passcode:\n( HINT: the factory default is 00000 )\n\n• press EXIT to cancel.",
					handleinput: function() 
					{
						handleLogin();
					} 
				},
	
	UNLOCKED: 	{
					feedbackPattern: "0000",
					name: "UNLOCKED",
					glow: ["btnExit","btnMenu", "btnTest", "btnDemo", "btnPower"],
					explanation: "The sign is unlocked and ready for programming.",
					nextSteps: "• press MENU to go to the next setting.\n\n• press DEMO to put the sign into DEMO mode.\n\n• press TEST to put the sign into TEST mode.\n\n• press the ON/OFF button to place the sign into STANDBY mode, where you can set up a 24 hour schedule.\n\n• press EXIT to exit.",
					handleinput: function() 
					{
						if (signMemory.commandChain.includes("btnExit"))
						{
							handleExit();
						}
						else if (signMemory.commandChain.includes("btnMenu"))
						{
							setSignState(signState.MINSPEED);
						}
						else if (signMemory.commandChain.includes("btnPower"))
						{
							setStandBy(1);
							
							setSignState(signState.STANDBY);
						}
						else if (signMemory.commandChain.includes("btnTest"))
						{
							signMemory.testModecoroutine = setTimeout(handleTestMode, 1000);
							setSignState(signState.TEST);
						}
						else if (signMemory.commandChain.includes("btnDemo"))
						{
							signMemory.demoModeValue = signState.MINSPEED.current;
							signMemory.demoModecoroutine = setTimeout(handleDemoMode, 1000);
							setSignState(signState.DEMO);
						}
					} 
				},

	TEST: 		{ 
					feedbackPattern: "0000", 
					name: "TEST MODE", 
					glow: ["btnExit","btnMenu"],
					explanation: "The sign is in test mode, and will run through all 10 digits (0-9) on the right side of the display, then all 10 digits on the left side.",
					nextSteps: "• press MENU to go to the first menu setting.\n\n• press EXIT to exit test mode.",
					handleinput: function()
					{
						
						if (signMemory.commandChain.includes("btnExit"))
						{
							clearTimeout(signMemory.testModecoroutine);
							setSignState(signState.UNLOCKED);
						}
						else if (signMemory.commandChain.includes("btnMenu"))
						{
							clearTimeout(signMemory.testModecoroutine);
							setSignState(signState.MINSPEED);
						}
					}
				},
				
	DEMO: 		{ 
					feedbackPattern: "0000", 
					name: "DEMO MODE", 
					glow: ["btnExit","btnMenu"],
					explanation: "The sign is in demo mode, and will now sequence through a set of numbers that reflect your set speed ranges.",
					nextSteps: "• press MENU to go to the first menu setting.\n\n• press EXIT to exit demo mode.",
					handleinput: function()
					{
						if (signMemory.commandChain.includes("btnExit"))
						{
							clearTimeout(signMemory.demoModecoroutine);
							setSignState(signState.UNLOCKED);
						}
						else if (signMemory.commandChain.includes("btnMenu"))
						{
							clearTimeout(signMemory.demoModecoroutine);
							setSignState(signState.MINSPEED);
						}
					}
				},
				
	STANDBY: 	{ 
					feedbackPattern: "0000",
					name: "STANDBY MODE", 
					glow: ["btnStepUp","btnStepDown", "btnPower"],
					explanation: "The sign will not respond to traffic by default in standby mode, but it WILL switch itself on and off if a 24 hour schedule is set.",
					nextSteps: "• press the UP or DOWN arrows to start setting a schedule.\n\n• press the POWER button to bring the sign out of standby mode ( NOTE this will delete any schedules that have been set ).",
					handleinput: function() 
					{
						if (signMemory.commandChain.includes("btnStepUp"))
						{
							setSignState(signState.SCHEDULEA);
						}
						else if (signMemory.commandChain.includes("btnStepDown"))
						{
							setSignState(signState.SCHEDULEA);
						}
						else if (signMemory.commandChain.includes("btnPower"))
						{
							resetSchedule();
							setStandBy(0);
							setSignState(signState.UNLOCKED);
						}						

					} 
				},
	
	
	
	MINSPEED: 	{ 
					feedbackPattern: "1000",
					name: "MINIMUM SPEED", 
					glow: ["btnExit","btnMenu", "btnOk", "btnStepDown", "btnStepUp"],
					explanation: "The sign is showing the speed at which it will start displaying feedback to drivers.",
					nextSteps: "Change the setting:\n• press OK to UNLOCK it\n• use the UP / DOWN arrows to set it\n  (or press zero and type in the value)\n• press OK again to SAVE it.\n\n\nOr...\n• press MENU to go to the next setting.\n• press EXIT to exit.",					
					min: 1, 
					max: 99, 
					current: 15, 
					handleinput: function() 
					{
						handleMenuItem();
						if (signMemory.commandChain.includes("btnExit"))
						{
							handleExit();
						}
						if (signMemory.commandChain.includes("btnMenu"))
						{
							setSignState(signState.SPEEDLIMIT);
						}
					} 
				},
				
	SPEEDLIMIT: { 
					feedbackPattern: "0100",
					name: "SPEED LIMIT",
					glow: ["btnExit","btnMenu", "btnOk", "btnStepDown", "btnStepUp"], 	
					explanation: "The sign is showing the speed limit of the road that it is being deployed on.",
					nextSteps: "Change the setting:\n• press OK to UNLOCK it\n• use the UP / DOWN arrows to set it\n  (or press zero and type in the value)\n• press OK again to SAVE it.\n\n\nOr...\n• press MENU to go to the next setting.\n• press EXIT to exit.",					
					min: 2, 
					max: 99, 
					current: 25, 
					handleinput: function() 
					{
						handleMenuItem();
						if (signMemory.commandChain.includes("btnExit"))
						{
							handleExit();
						}
						if (signMemory.commandChain.includes("btnMenu"))
						{
							setSignState(signState.MAXSPEED);
						}
					} 
				},
				
	MAXSPEED: 	{ 
					feedbackPattern: "1100", 
					name: "MAXIMUM SPEED",
					glow: ["btnExit","btnMenu", "btnOk", "btnStepDown", "btnStepUp"], 
					explanation: "The sign is showing the speed at which it will stop displaying feedback to drivers.",
					nextSteps: "Change the setting:\n• press OK to UNLOCK it\n• use the UP / DOWN arrows to set it\n  (or press zero and type in the value)\n• press OK again to SAVE it.\n\n\nOr...\n• press MENU to go to the next setting.\n• press EXIT to exit.",					
					min: 3, 
					max: 99, 
					current: 50,
					handleinput: function() 
					{
						handleMenuItem();
						if (signMemory.commandChain.includes("btnExit"))
						{
							handleExit();
						}
						if (signMemory.commandChain.includes("btnMenu"))
						{
							setSignState(signState.SQUELCH);
						}
					} 					
				},
				
	SQUELCH: 	{ 
					feedbackPattern: "0010", 
					name: "RADAR SQUELCH",
					glow: ["btnExit","btnMenu", "btnOk", "btnStepDown", "btnStepUp"],
					explanation: "The default squelch setting is 20.\nIncreasing this value will help filter out unwanted detections.\nDecreasing this value will make the radar more sensitive.",
					nextSteps: "Change the setting:\n• press OK to UNLOCK it\n• use the UP / DOWN arrows to set it\n  (or press zero and type in the value)\n• press OK again to SAVE it.\n\n\nOr...\n• press MENU to go to the next setting.\n• press EXIT to exit.",					
					min: 0, 
					max: 99, 
					current: 20,
					handleinput: function() 
					{
						handleMenuItem();
						if (signMemory.commandChain.includes("btnExit"))
						{
							handleExit();
						}
						if (signMemory.commandChain.includes("btnMenu"))
						{
							setSignState(signState.UNITS);
						}
					} 					
				},
				
	UNITS: 		{ 
					feedbackPattern: "1010", 
					name: "UNITS OPTION", 
					glow: ["btnExit","btnMenu", "btnOk", "btnStepDown", "btnStepUp"], 
					explanation: "The sign is showing the units it is using to measure speed.\n0 = MPH, 1 = KPH.",
					nextSteps: "Change the setting:\n• press OK to UNLOCK it\n• use the UP / DOWN arrows to set it\n  (or press zero and type in the value)\n• press OK again to SAVE it.\n\n\nOr...\n• press MENU to go to the next setting.\n• press EXIT to exit.",					
					min: 0, 
					max: 1, 
					current: 0, 
					handleinput: function() 
					{
						handleMenuItem();
						if (signMemory.commandChain.includes("btnExit"))
						{
							handleExit();
						}
						if (signMemory.commandChain.includes("btnMenu"))
						{
							setSignState(signState.BRIGHTNESS);
						}
					} 
				},
				
	BRIGHTNESS: { 
					feedbackPattern: "0110", 
					name: "BRIGHTNESS",
					glow: ["btnExit","btnMenu", "btnOk", "btnStepDown", "btnStepUp"], 
					explanation: "The sign is showing a value that can be tweaked to darken or brighten the numbers displayed.",
					nextSteps: "Change the setting:\n• press OK to UNLOCK it\n• use the UP / DOWN arrows to set it\n  (or press zero and type in the value)\n• press OK again to SAVE it.\n\n\nOr...\n• press MENU to go to the next setting.\n• press EXIT to exit.",					
					min: 0, 
					max: 31, 
					current: 16,
					handleinput: function() 
					{
						handleMenuItem();
						if (signMemory.commandChain.includes("btnExit"))
						{
							handleExit();
						}
						if (signMemory.commandChain.includes("btnMenu"))
						{
							setSignState(signState.STARTOPTION);
						}
					} 					
				},
				
	STARTOPTION:{ 
					feedbackPattern: "1110", 
					name: "START UP OPTION",
					glow: ["btnExit","btnMenu", "btnOk", "btnStepDown", "btnStepUp"], 
					explanation: "This value corresponds to the sign's start-up behavior.\n0 = Start up in STANDBY mode,\n1 = Start up in NORMAL mode.",
					nextSteps: "Change the setting:\n• press OK to UNLOCK it\n• use the UP / DOWN arrows to set it\n  (or press zero and type in the value)\n• press OK again to SAVE it.\n\n\nOr...\n• press MENU to go to the next setting.\n• press EXIT to exit.",					
					min: 0, 
					max: 1, 
					current: 1,
					handleinput: function() 
					{
						handleMenuItem();
						if (signMemory.commandChain.includes("btnExit"))
						{
							handleExit();
						}
						if (signMemory.commandChain.includes("btnMenu"))
						{
							setSignState(signState.PASSKEY1);
						}
					} 					
				},
				
	PASSKEY1:	{ 
					feedbackPattern: "0001",
					name: "PASSKEY DIGIT #1",
					glow: ["btnExit","btnMenu", "btnOk", "btnStepDown", "btnStepUp"], 
					explanation: "The sign is showing the first digit of the passcode.",
					nextSteps: "Change the setting:\n• press OK to UNLOCK it\n• use the UP / DOWN arrows to set it\n  (or press zero and type in the value)\n• press OK again to SAVE it.\n\n\nOr...\n• press MENU to go to the next setting.\n• press EXIT to exit.",					
					min: 0, 
					max: 9, 
					current: 0,
					handleinput: function() 
					{
						handleMenuItem();
						if (signMemory.commandChain.includes("btnExit"))
						{
							handleExit();
						}
						if (signMemory.commandChain.includes("btnMenu"))
						{
							setSignState(signState.PASSKEY2);
						}
					} 					
				},
				
	PASSKEY2:	{ 
					feedbackPattern: "1001",
					name: "PASSKEY DIGIT #2",
					glow: ["btnExit","btnMenu", "btnOk", "btnStepDown", "btnStepUp"], 	
					explanation: "The sign is showing the second digit of the passcode.",
					nextSteps: "Change the setting:\n• press OK to UNLOCK it\n• use the UP / DOWN arrows to set it\n  (or press zero and type in the value)\n• press OK again to SAVE it.\n\n\nOr...\n• press MENU to go to the next setting.\n• press EXIT to exit.",					
					min: 0, 
					max: 9, 
					current: 0, 
					handleinput: function() 
					{
						handleMenuItem();
						if (signMemory.commandChain.includes("btnExit"))
						{
							handleExit();
						}
						if (signMemory.commandChain.includes("btnMenu"))
						{
							setSignState(signState.PASSKEY3);
						}
					} 
				},
	
	PASSKEY3:	{ 
					feedbackPattern: "0101",
					name: "PASSKEY DIGIT #3",
					glow: ["btnExit","btnMenu", "btnOk", "btnStepDown", "btnStepUp"],
					explanation: "The sign is showing the third digit of the passcode.",
					nextSteps: "Change the setting:\n• press OK to UNLOCK it\n• use the UP / DOWN arrows to set it\n  (or press zero and type in the value)\n• press OK again to SAVE it.\n\n\nOr...\n• press MENU to go to the next setting.\n• press EXIT to exit.",					
					min: 0, 
					max: 9, 
					current: 0,
					handleinput: function() 
					{
						handleMenuItem();
						if (signMemory.commandChain.includes("btnExit"))
						{
							handleExit();
						}
						if (signMemory.commandChain.includes("btnMenu"))
						{
							setSignState(signState.PASSKEY4);
						}
					} 					
				},
				
	PASSKEY4:	{ 
					feedbackPattern: "1101",
					name: "PASSKEY DIGIT #4",
					glow: ["btnExit","btnMenu", "btnOk", "btnStepDown", "btnStepUp"], 	
					explanation: "The sign is showing the fourth digit of the passcode.",
					nextSteps: "Change the setting:\n• press OK to UNLOCK it\n• use the UP / DOWN arrows to set it\n  (or press zero and type in the value)\n• press OK again to SAVE it.\n\n\nOr...\n• press MENU to go to the next setting.\n• press EXIT to exit.",					
					min: 0, 
					max: 9, 
					current: 0,
					handleinput: function() 
					{
						handleMenuItem();
						if (signMemory.commandChain.includes("btnExit"))
						{
							handleExit();
						}
						if (signMemory.commandChain.includes("btnMenu"))
						{
							setSignState(signState.PASSKEY5);
						}
					} 					
				},
				
	PASSKEY5:	{ 
					feedbackPattern: "0011",
					name: "PASSKEY DIGIT #5",
					glow: ["btnExit","btnMenu", "btnOk", "btnStepDown", "btnStepUp"], 
					explanation: "The sign is showing the fifth digit of the passcode.",
					nextSteps: "Change the setting:\n• press OK to UNLOCK it\n• use the UP / DOWN arrows to set it\n  (or press zero and type in the value)\n• press OK again to SAVE it.\n\n\nOr...\n• press MENU to go to the next setting.\n• press EXIT to exit.",					
					min: 0, 
					max: 9, 
					current: 0,
					handleinput: function() 
					{
						handleMenuItem();
						if (signMemory.commandChain.includes("btnExit"))
						{
							handleExit();
						}
						if (signMemory.commandChain.includes("btnMenu"))
						{
							setSignState(signState.UNLOCKED);
						}
					} 					
				},
};

let signMemory = 
{
	led5coroutine: null,
	passkeycoroutine: null,
	commandChain: "",
	led5Delay: 1000,
	editingMenuItem: false,
	signUnlocked: 0,
	standby: 0,
	volatileMenuValue: 0,
	testModeValue: 0,
	demoModeValue: 0,
	testModecoroutine: null,
	demoModecoroutine: null,
	demoModeFlashCount: 0,
	currentSignState: signState.LOCKED,
	schedulestring: "",
};

//#endregion

//======================================
//  sign functionality
//======================================
//#region
function getPasskeyString()
{
    var digit1 = signState.PASSKEY1.current.toString(); 
    var digit2 = signState.PASSKEY2.current.toString();
    var digit3 = signState.PASSKEY3.current.toString();
    var digit4 = signState.PASSKEY4.current.toString();
    var digit5 = signState.PASSKEY5.current.toString();
    var result =  digit1 + digit2 + digit3 + digit4 + digit5;
    return result;
};

function clearCommandChain()
{
    signMemory.commandChain = "";
    //console.log("commandChain cleared!");
};

function handleTestMode()
{
	setDigits(signMemory.testModeValue);
	if (signMemory.testModeValue < 10)
	{
		signMemory.testModeValue = signMemory.testModeValue + 1;
	}
	else if (signMemory.testModeValue < 91)
	{
		signMemory.testModeValue = signMemory.testModeValue + 10;
	}
	else
	{
		signMemory.testModeValue =  0;
	}
	
	signMemory.testModecoroutine = setTimeout(handleTestMode, 1000);
}

function handleDemoMode()
{
	clearTimeout(signMemory.demoModecoroutine);
	
	if (signMemory.demoModeValue < signState.SPEEDLIMIT.current)
	{
		setDigits(signMemory.demoModeValue);
		signMemory.demoModeValue = signMemory.demoModeValue + 2;
		signMemory.demoModecoroutine = setTimeout(handleDemoMode, 1000);
	}
	else if (signMemory.demoModeValue < signState.MAXSPEED.current - 3)
	{
		setDigits(signMemory.demoModeValue);
		if (signMemory.demoModeFlashCount < 6)
		{
			signMemory.demoModeFlashCount = signMemory.demoModeFlashCount + 1;
		}
		else
		{
			signMemory.demoModeValue = signMemory.demoModeValue + 2;
			signMemory.demoModeFlashCount = 0;
		}
		
		(signMemory.demoModeFlashCount % 2 === 0) ? setDigits(signMemory.demoModeValue) : clearBulbs();
		signMemory.demoModecoroutine = setTimeout(handleDemoMode, 175); 
	}
	else
	{	
		if (signMemory.demoModeFlashCount < 6)
		{
			signMemory.demoModeValue = signState.MAXSPEED.current;
			(signMemory.demoModeFlashCount % 2 === 0) ? setDigits(signMemory.demoModeValue) : clearBulbs();
			signMemory.demoModeFlashCount = signMemory.demoModeFlashCount + 1;
			signMemory.demoModecoroutine = setTimeout(handleDemoMode, 175); 
		}
		else
		{
			signMemory.demoModeFlashCount = 0;
			signMemory.demoModeValue = signState.MINSPEED.current;
			signMemory.demoModecoroutine = setTimeout(handleDemoMode, 1000);
		}
	}
	
}

function setSignState(state)
{
	clearCommandChain();
    signMemory.currentSignState = state;
	document.getElementById("title").textContent = signMemory.currentSignState.name;
	document.getElementById("explanation").textContent = signMemory.currentSignState.explanation;
	
	updateScheduleExplanation();
	
	document.getElementById("steps").textContent = signMemory.currentSignState.nextSteps;
	makeRemoteButtonsGlow(signMemory.currentSignState.glow);

	if (signMemory.currentSignState.hasOwnProperty('current'))
	{
		setDigits(signMemory.currentSignState.current);
	}
	else
	{
		clearBulbs();
	}
	
    setLEDFeedbackPattern(signMemory.currentSignState.feedbackPattern);
};

function resetSchedule()
{
	//("resetting schedule");
	signMemory.schedulestring = "";
	signState.SCHEDULEA.current = 0;
	signState.SCHEDULEB.current = 0;
	signState.SCHEDULEC.current = 0;
	signState.SCHEDULED.current = 0;
	//console.log("schedule s: " + signMemory.schedulestring);
	//console.log("schedule A: " + signState.SCHEDULEA.current);
	//console.log("schedule B: " + signState.SCHEDULEB.current);
	//console.log("schedule C: " + signState.SCHEDULEC.current);
	//console.log("schedule D: " + signState.SCHEDULED.current);
};

function setStandBy(value)
{
	resetSchedule();
	signMemory.standby = value;
	if (signMemory.standby === 0)
	{
		signState.STARTOPTION.current = 1;
		signMemory.led5Delay = 1000;
	}
	else
	{
		signState.STARTOPTION.current = 0;
		signMemory.led5Delay = 15000;	
	}
	//console.log("setting standby ms to "+ String(signMemory.led5Delay));
	clearTimeout(signMemory.led5coroutine);
	signMemory.led5coroutine = statusLEDBlinkActive();
};


function handleExit()
{
    signMemory.signUnlocked = 0;
    //get whether we are in on or standby 
    let startup =  signState.STARTOPTION.current;
    if (startup > 0)
    {
        setSignState(signState.LOCKED);
    }
    else
    {
        setSignState(signState.STANDBY); 
    }
};

function handleLogin()
{
    if (!signMemory.signUnlocked)
    {
		if (signMemory.commandChain.includes("btnExit"))
		{
			handleExit();
		}
		else
		{
			var passkey = getPasskeyString();
			let code = signMemory.commandChain.split("btn").join("");
			if (code.length > passkey.length)
			{
				handleExit();
			}
			for( var i = 0; i < code.length; i++ ) 
			{
				if (passkey.indexOf(code[i]) == -1)
				{
					handleExit();
				}
				else
				{
					//light up just the next led down (and all of them on 5)
					var pattern = "1010";
					switch (i)
					{
						case 0:
							pattern = "1000";
						break;
						case 1:
							pattern = "0100";
						break;
						case 2:
							pattern = "0010";
						break;
						case 3:
							pattern = "0001";
						break;
					}

					//then press OK to move into menu programming
					setLEDFeedbackPattern(pattern);
				}
			}
			if (passkey == code)
			{
				signMemory.signUnlocked = 1;
				setSignState(signState.UNLOCKED);
				setLEDFeedbackPattern("1111");
				signMemory.passkeycoroutine = setTimeout(turnOffPassKeyLights, 11000);
			}
		}
	}
};

function getTimeAsString() 
{
  var today = new Date();
  var h = today.getHours();
  if (h > 12)
  {
	  h = h - 12;
  }
  var m = today.getMinutes();
  if (m < 10)
  {
	  m = "0" + m;
  }
  return h + ":" + m;
}

function updateScheduleExplanation()
{
	//console.log("updating schedule explanation");
	
	if (signMemory.currentSignState.name.includes("STANDBY"))
	{
		if (signMemory.schedulestring === "")
		{
			document.getElementById("explanation").textContent = signMemory.currentSignState.explanation + "\n\nCurrently the sign is not running a schedule.";
			return;
		}
		else
		{
			document.getElementById("explanation").textContent = signMemory.currentSignState.explanation + signMemory.schedulestring;
			return;
		}
	}
	if (signMemory.currentSignState.name.includes("SCHEDULE"))
	{
		
		
	
	//get current time
	var pm = false;
	var today = new Date();
	var h = today.getHours();
	h = h + signState.SCHEDULEA.current;
	if (h >= 24) { h = h - 24; }
	if (h > 12) { h = h - 12; pm = true; }
	if (h < 10) { h = "0" + h; }
	var m = today.getMinutes();
	if (m < 10) { m = "0" + m; }
	
	//SCHEDULEA
	signMemory.schedulestring = "\n\nCurrently the sign is scheduled to:\n• come on at " + h + ":" + m;
	(pm === false) ? signMemory.schedulestring = signMemory.schedulestring + " am" : signMemory.schedulestring = signMemory.schedulestring + " pm" ;
	
	if ( signMemory.currentSignState.name.includes("DELAY #1"))
	{
		document.getElementById("explanation").textContent = signMemory.currentSignState.explanation + signMemory.schedulestring;
		return;
	}
	
	//SCHEDULEB
	signMemory.schedulestring += "\n• stay on for " + signState.SCHEDULEB.current + " hours.";
	if ( signMemory.currentSignState.name.includes("HOURS #1"))
	{
		document.getElementById("explanation").textContent = signMemory.currentSignState.explanation + signMemory.schedulestring;
		return;
	}
	
	//SCHEDULEC
	signMemory.schedulestring += "\n• then switch off for " + signState.SCHEDULEC.current + " hours.";
	if ( signMemory.currentSignState.name.includes("DELAY #2"))
	{
		document.getElementById("explanation").textContent = signMemory.currentSignState.explanation + signMemory.schedulestring;
		return;
	}
	
	signMemory.schedulestring += "\n• and finally come back on for " + signState.SCHEDULED.current + " hours.";
	document.getElementById("explanation").textContent = signMemory.currentSignState.explanation + signMemory.schedulestring;
	}
};

function handlescheduleitem(usesupdown)
{
	var increment = "btnStepUp";
	var decrement = "btnStepDown";

	if (usesupdown === false)
	{
		increment = "btnVolUp";
		decrement = "btnVolDown";
	}

	 //handle step up and step down operations
	 if (signMemory.commandChain.includes(increment))
	 {
		 clearCommandChain();

		 signMemory.currentSignState.current =  signMemory.currentSignState.current + 1;
		 if (signMemory.currentSignState.current > signMemory.currentSignState.max)
		 {
			signMemory.currentSignState.current = signMemory.currentSignState.max;  
		 }
		 setDigits(signMemory.currentSignState.current);
	 }
	 else if (signMemory.commandChain.includes(decrement)) 
	 {
		 clearCommandChain();
		 signMemory.currentSignState.current =  signMemory.currentSignState.current - 1;
		 if (signMemory.currentSignState.current <  signMemory.currentSignState.min)
		 {
			signMemory.currentSignState.current = signMemory.currentSignState.min;
		 }
		 setDigits(signMemory.currentSignState.current);
	 } 		
	 //handle numeric input
	 else if (signMemory.commandChain.includes("btn0"))       
	 {
		 //parse string for numbers
		 let numstr = signMemory.commandChain.replaceAll("btn", "");
		 if (/^\d+$/.test(numstr) === false)
		 {
			 clearCommandChain();
			// console.log("non-digit entered!");
			 return;
		 }

		 if (numstr.length > 2) //there are three digits including a leading zero
		 {  
			 var leftdigit = parseInt(numstr[1]);
			 var rightdigit = parseInt(numstr[2]);
			 clearBulbs();
			 setLeftDigit(leftdigit);
			 setRightDigit(rightdigit);
			 signMemory.currentSignState.current = (leftdigit* 10) + rightdigit;
			 clearCommandChain();
		 }
		 else if (numstr.length > 1) //there are two digits including a leading zero
		 {
			 var rightdigit = parseInt(numstr[1]);
			 clearBulbs();
			 setRightDigit(rightdigit);
			 signMemory.currentSignState.current = rightdigit;
		 }
		 else //there is only one digit
		 {
			  var rightdigit = parseInt(numstr[0]);
			  clearBulbs();
			  setRightDigit(rightdigit);
			  signMemory.currentSignState.current = rightdigit;
		 }
		 //boundary checks
		 if (signMemory.currentSignState.current > signMemory.currentSignState.max)
		 {
			signMemory.currentSignState.current = signMemory.currentSignState.max;  
		 }
		 if (signMemory.currentSignState.current < signMemory.currentSignState.min)
		 {
			signMemory.currentSignState.current = signMemory.currentSignState.min;  
		 }
	 }
}


function handleMenuItem()
{
		//handle user pressing OK
		if (signMemory.commandChain.includes("btnOk"))
		{
			clearCommandChain();
	  
			//customer is already editing a menu item. Time to save it.
			if (signMemory.editingMenuItem === true)
			{
				signMemory.editingMenuItem = false;
		
				//if we are editing the start up option specifically, set standby state as well. 
				if (signMemory.currentSignState.name === signState.STARTOPTION.name)
				{
					signState.STARTOPTION.current = signMemory.volatileMenuValue;
					setStandBy(signMemory.volatileMenuValue);
				}
		
				//if we are editing minspeed
				if (signMemory.currentSignState.name === signState.MINSPEED.name)
				{
					//don't save volatile memory if value is higher than speed limit or max speed
					if (signMemory.volatileMenuValue >= signState.SPEEDLIMIT.current || signMemory.volatileMenuValue >= signState.MAXSPEED.current)
					{
						setDigits(signMemory.currentSignState.current); 
						return;
					}
				}
				//if we are editing speed limit
				if (signMemory.currentSignState.name === signState.SPEEDLIMIT.name)
				{
					//don't save volatile memory if value is higher than max speed
					if (signMemory.volatileMenuValue >= signState.MAXSPEED.current)
					{
						setDigits(signMemory.currentSignState.current); 
						return;
					}
					//or push down min speed value if needed
					if (signState.MINSPEED.current >= signMemory.volatileMenuValue)
					{
						signState.MINSPEED.current = Math.max(signMemory.volatileMenuValue - 1, 1);
					}
				}
				if (signMemory.currentSignState.name === signState.MAXSPEED.name)
				{
					//push down speed limit value if needed
					if (signState.SPEEDLIMIT.current >= signMemory.volatileMenuValue)
					{
						signState.SPEEDLIMIT.current = Math.max(signMemory.volatileMenuValue - 1, 2);
					}
					//and push down min speed value if needed 
					if (signState.MINSPEED.current >= signState.SPEEDLIMIT.current)
					{
						signState.MINSPEED.current = Math.max(signState.SPEEDLIMIT.current - 1, 1);
					}
				}
				//finally store volatile value in sign state
				signMemory.currentSignState.current = signMemory.volatileMenuValue;
			}
			else //customer is not already editing a menu item so unlock it and set volatile menu. 
			{
				signMemory.editingMenuItem = true;
				signMemory.volatileMenuValue = signMemory.currentSignState.current;
			}
        return;
    }
	//if user has not pressed OK, handle when we are 'within' the editing procedure
    if (signMemory.editingMenuItem === true) 
    {
        //handle step up and step down operations
        if (signMemory.commandChain.includes("btnStepUp"))
        {
            clearCommandChain();
            signMemory.volatileMenuValue = signMemory.volatileMenuValue + 1;
            if (signMemory.volatileMenuValue > signMemory.currentSignState.max)
            {
                signMemory.volatileMenuValue = signMemory.currentSignState.max;  
            }
            setDigits(signMemory.volatileMenuValue);
        }
        else if (signMemory.commandChain.includes("btnStepDown")) 
        {
            clearCommandChain();
            signMemory.volatileMenuValue = signMemory.volatileMenuValue - 1;
            if (signMemory.volatileMenuValue < signMemory.currentSignState.min)
            {
                signMemory.volatileMenuValue = signMemory.currentSignState.min;
            }
            setDigits(signMemory.volatileMenuValue);
        } 		
        //handle numeric input
        else if (signMemory.commandChain.includes("btn0"))       
        {
            //parse string for numbers
            let numstr = signMemory.commandChain.replaceAll("btn", "");
            if (/^\d+$/.test(numstr) === false)
            {
                clearCommandChain();
               // console.log("non-digit entered!");
                return;
            }

            if (numstr.length > 2) //there are three digits including a leading zero
            {  
                var leftdigit = parseInt(numstr[1]);
                var rightdigit = parseInt(numstr[2]);
                clearBulbs();
                setLeftDigit(leftdigit);
                setRightDigit(rightdigit);
                signMemory.volatileMenuValue = (leftdigit* 10) + rightdigit;
                clearCommandChain();
            }
            else if (numstr.length > 1) //there are two digits including a leading zero
            {
                var rightdigit = parseInt(numstr[1]);
                clearBulbs();
                setRightDigit(rightdigit);
                signMemory.volatileMenuValue = rightdigit;
            }
			else //there is only one digit
			{
				 var rightdigit = parseInt(numstr[0]);
				 clearBulbs();
                 setRightDigit(rightdigit);
				 signMemory.volatileMenuValue = rightdigit;
			}
            //boundary checks
            if (signMemory.volatileMenuValue > signMemory.currentSignState.max)
            {
                signMemory.volatileMenuValue = signMemory.currentSignState.max;  
            }
            if (signMemory.volatileMenuValue < signMemory.currentSignState.min)
            {
                signMemory.volatileMenuValue = signMemory.currentSignState.min;  
            }
        }
    }
};
//#endregion

//======================================
//	LED feedback lights
//======================================
//#region
function turnOffPassKeyLights()
{
	if (fb1.style.fill === "red" &&
		fb2.style.fill === "red" &&
		fb3.style.fill === "red" &&
		fb4.style.fill === "red")
		{
			setLEDFeedbackPattern("0000");
		}
};

function statusLEDBlinkPassive() 
{
    fb5.style.fill="#1f1f1f";
	fb5large.style.backgroundColor="#51515100";
    signMemory.led5coroutine = setTimeout(statusLEDBlinkActive, signMemory.led5Delay);
};

function statusLEDBlinkActive()  
{
    fb5.style.fill="red";
	fb5large.style.backgroundColor="red";
    signMemory.led5coroutine = setTimeout(statusLEDBlinkPassive, 500 );
};

function setLEDFeedbackPattern(str)
{
    (str.charAt(0) == 1) ? fb1.style.fill="red" : fb1.style.fill="#1f1f1f";
    (str.charAt(1) == 1) ? fb2.style.fill="red" : fb2.style.fill="#1f1f1f";
    (str.charAt(2) == 1) ? fb3.style.fill="red" : fb3.style.fill="#1f1f1f";
    (str.charAt(3) == 1) ? fb4.style.fill="red" : fb4.style.fill="#1f1f1f";
	
	(str.charAt(0) == 1) ? fb1large.style.backgroundColor="red" : fb1large.style.backgroundColor="#B1B1B100";
	(str.charAt(1) == 1) ? fb2large.style.backgroundColor="red" : fb2large.style.backgroundColor="#B1B1B100";
	(str.charAt(2) == 1) ? fb3large.style.backgroundColor="red" : fb3large.style.backgroundColor="#B1B1B100";
	(str.charAt(3) == 1) ? fb4large.style.backgroundColor="red" : fb4large.style.backgroundColor="#B1B1B100";
};
//#endregion

//======================================
//	remote control
//======================================
//#region
var remotebtns = ["btn0", "btn1", "btn2", "btn3", "btn4", "btn5", "btn6", "btn7", "btn8", "btn9", "btnSign", "btnTest", "btnPower", "btnMenu", "btnExit", "btnStepUp","btnOk", "btnStepDown", "btnDemo", "btnVolUp", "btnVolDown"];

function setupRemote()
{
	remotebtns.forEach(function (item) 
	{
		document.getElementById(item).addEventListener("click", remoteClick);
		document.getElementById(item).addEventListener("mousedown", remoteMouseDown);
		document.getElementById(item).addEventListener("mouseup", remoteMouseUp);
	});
};

function makeRemoteButtonsGlow(btnnames)
{
	for (var i=0; i < remotebtns.length; i++) 
	{
		
		var btn = document.getElementById(remotebtns[i]); 
		//btn.classList.remove("blink_me");
		if (btnnames && btnnames.indexOf(remotebtns[i]) >= 0)
		{
			//btn.classList.add('blink_me');
			btn.style.stroke = "white";
			btn.style.opacity = 1.0;
		}
		else
		{
			btn.style.opacity = 0.25;
			btn.style.stroke = "#808080EE";
		}
	}
};

function remoteClick()
{
    var btnId = jQuery(this).attr("id");
    signMemory.commandChain = signMemory.commandChain.concat(String(btnId));
  //  console.log(signMemory.commandChain);
	signMemory.currentSignState.handleinput(signMemory.commandChain);
	
    //keep commandChain string to a sensible limit
    if (signMemory.commandChain.length > 64)
    {
        var start = signMemory.commandChain.length - 32;
        signMemory.commandChain = signMemory.commandChain.substring(start, signMemory.commandChain.length - 1);
    }
}

function remoteMouseDown()
{
	document.getElementById("remoteled").style.fill = "#FF0000";
}

function remoteMouseUp()
{
    document.getElementById("remoteled").style.fill = "#808080";
}
//#endregion

//======================================
//  entry point
//======================================
$(document).ready(function() 
{
    setupRemote();
	setStandBy(0);
    setSignState(signState.LOCKED);
});