﻿// ==UserScript==
// @name         Alienware Arena helper
// @namespace    https://github.com/thomas-ashcraft
// @version      0.3.9
// @description  Earn daily ARP easily
// @author       Thomas Ashcraft
// @match        *://*.alienwarearena.com/*
// @match        *://*.alienwarearena.com//*
// @icon         https://www.alienwarearena.com/favicon.ico
// @grant        none
// @noframes
// ==/UserScript==

(function() {
	// You can configure options through the user interface. It is not recommended to edit the script for these purposes.
	var version = "0.3.9";
	var DEBUG = false; // Developer option. Default: false

	var status_message_delay_default	= 5000;
	var actions_delay_min_default		= 1000;
	var actions_delay_max_default		= 5000;
	var tot_add_votes_min_default		= 3;
	var tot_add_votes_max_default		= 7;
	var show_key_on_marked_giveaways_default = "true";

	var actions_delay_min		= parseInt(localStorage.getItem('awah_actions_delay_min'), 10) || actions_delay_min_default;
	var actions_delay_max		= parseInt(localStorage.getItem('awah_actions_delay_max'), 10) || actions_delay_max_default;
	var tot_add_votes_min		= parseInt(localStorage.getItem('awah_tot_add_votes_min'), 10) || tot_add_votes_min_default;
	var tot_add_votes_max		= parseInt(localStorage.getItem('awah_tot_add_votes_max'), 10) || tot_add_votes_max_default;
	var show_key_on_marked_giveaways	= localStorage.getItem('awah_show_key_on_marked_giveaways') || show_key_on_marked_giveaways_default;
	show_key_on_marked_giveaways = (show_key_on_marked_giveaways === "true");
	var status_message_delay	= parseInt(localStorage.getItem('awah_status_message_delay'), 10) || status_message_delay_default;

	var url = window.location.href;
	if(DEBUG) console.log("🐾 url: " + url);

	var path = window.location.pathname;
	path = path.replace(/\/+/g, "/");
	if(DEBUG) console.log("🐾 path: " + path);

	// Embed style
	var helper_style = `
		#background {}
		.awah-btn-tots {background-color: #f05000;}
		.awah-btn-cons,
		.awah-btn-cons:hover {color: gold;}
		.awah-arp-pts {float: right; clear: both; width: 100%}
		.awah-arp-status {float: right; clear: both; white-space: nowrap; border-bottom: 1px solid #1c1e22;}
		.awah-arp-status > span {float: right; clear: both; position: relative; animation: awah-slide-from-bottom 0.25s ease-out 1 forwards;}
		#arp-toast .toast-header {overflow: visible !important;}
		.awah-ui-overlay {float: right; clear: both; font-size: smaller !important; pointer-events: none; position: absolute; bottom: 102%; right: 0; min-width: 100%; padding: inherit; text-shadow: 2px 2px 2px rgb(0, 0, 0), -1px -1px 2px rgb(0, 0, 0), 5px 5px 4px rgb(0, 0, 0), -4px -4px 4px rgb(0, 0, 0); text-align: right; background: rgba(0, 0, 0, 0) linear-gradient(to right bottom, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0) 50%, rgba(0, 0, 0, 0.85) 85%, rgba(0, 0, 0, 0.85) 100%) no-repeat scroll 0 0;}
		.awah-grey {color: #767676;}
		.awah-casper-out {animation: awah-casper-out 0.6s ease-in !important;}
		.awah-arp-pts > span {clear: both; float: right; width: 100%; background-position: 50% 50%; background-repeat: no-repeat; background-size: 100% 12px;}
		.awah-arp-pts > span::after {content: ""; display: block; height: 0; clear: both;}

		.awah-options-btn {float: left; padding-left: 16px; cursor: pointer;}
		.awah-options-btn:hover {text-shadow: 0px 0px 3px rgba(75, 201, 239, 1), 0px 0px 12px rgba(75, 201, 239, 1); animation: awah-breathing-text-neon 2s ease 0s infinite alternate;}
		.awah-options-overlay {overflow: auto; float: left; clear: both; position: absolute; bottom: 0; right: calc(100% + 1px); height: 100%; width: 100%; padding: 0 11px; text-shadow: 2px 2px 2px rgb(0, 0, 0), -1px -1px 2px rgb(0, 0, 0); text-align: right; background: rgba(0, 0, 0, 0.85) repeat scroll 0 0; box-shadow: 0px 0px 3px 0px #54bbdb;}
		.awah-options-title {font-size: 16px; padding: 11px 0;}
		.awah-option {border-bottom: 1px solid #1c1e22; margin: 11px 0;}
		.awah-option::after {content: ""; display: block; height: 0; clear: both;}
		.awah-option label {width: 100%; margin: 0;}
		.awah-opt-title {float: left; /* line-height: 38px; */}
		.awah-opt-input {float: right; width: 24%; text-align: right; padding: 0 5px; height: auto; background: transparent; color: white; border-width: 0px 0px 1px 0px;}
		.awah-opt-desc {float: right; font-size: smaller;}
		#awah_restore_default {width: 100%;}
		input.awah-opt-input[type="checkbox"] {display: none;}
		.awah-opt-input[type="checkbox"] + div {transition: 0.25s all ease; position: relative; overflow: hidden;}
		.awah-opt-input[type="checkbox"] + div > div {transition: 0.25s all ease; background-color: #428bca; width: 24px; position: absolute; left: 0;}
		input.awah-opt-input[type="checkbox"]:checked + div {background-color: rgb(66, 139, 202, 0.4);}
		input.awah-opt-input[type="checkbox"]:checked + div > div {left: calc(100% - 24px);}
		.awah-opt-input[type="checkbox"] + div > div::before {content: 'ON'; position: absolute; right: 120%;}
		.awah-opt-input[type="checkbox"] + div > div::after {content: 'OFF'; color: #767676; position: absolute; left: 120%;}

		.awah-daily-reset-timer {min-width: 22%;}
		.toast-body table tbody > :nth-child(2n) {background: #090909}

		.account-settings-steam div.steam {background-color: #171a21; border-radius: 100px;}

		div.tile-content.awah-giveaway-taken a.Giveaway::before {content: attr(awahlabel); font-family: inherit; font-weight: 700; white-space: pre; overflow: hidden; width: 100%; height: 100%; text-shadow: 2px 2px 2px rgb(0, 0, 0), -1px -1px 2px rgb(0, 0, 0), 5px 5px 4px rgb(0, 0, 0), -4px -4px 4px rgb(0, 0, 0); background-color: rgba(0, 0, 0, 0); background-image: repeating-linear-gradient(135deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 0.35%, rgba(0,0,0,1) 0.35%, rgba(0,0,0,1) 0.7%);}
		div.tile-content.awah-giveaway-taken:not(:hover) {opacity: 0.3; transition: opacity 0.25s ease-in-out;}

		.awah-progress-bar-back {background-color: rgb(40, 37, 36); height: 12px;}
		.awah-progress-bar-front {background-color: #00a0f0;}
		.awah-progress-bar-simple {background-image: linear-gradient(90deg, #00a0f0 38%, rgb(40, 37, 36) 0%, rgb(40, 37, 36) 68%, rgba(40, 37, 36, 0) 0%);}
		.awah-progress-bar {background-image: linear-gradient(90deg, rgb(0, 160, 240) 38%, rgba(0, 160, 240, 0.2) 0%, rgba(0, 160, 240, 0.2) 47%, rgb(0, 160, 240) 48%, rgb(40, 37, 36) 0%);}

		@keyframes awah-slide-from-bottom {
			from {opacity: 0.5; bottom: -90px;}
			to {opacity: 1; bottom: 0px;}
		}
		@keyframes awah-casper-out {
			from {filter: blur(0px);}
			to {filter: blur(20px);}
		}
		@keyframes awah-breathing-text-neon {
			from {text-shadow: 0px 0px 3px rgba(75, 201, 239, 0.25), 0px 0px 12px rgba(75, 201, 239, 0.25);}
			to {text-shadow: 0px 0px 3px rgba(75, 201, 239, 1), 0px 0px 12px rgba(75, 201, 239, 1);}
		}
		@keyframes awah-new-tile-chunk-appears {
			from {opacity: 0.99;}
			to {opacity: 1;}
		}
		.tile-chunk {animation-duration: 0.001s; animation-name: awah-new-tile-chunk-appears;}
		`;
	document.head.appendChild(document.createElement('style')).innerHTML=helper_style.replace(/([\s\S]*?return;){2}([\s\S]*)}/,'$2');

	// ARP points initial readings
	var pm_counter = /Vote on Content(?:.|\n)*>(\d+) of (\d+)<\/td>(?:.|\n)*Vote on This or That(?:.|\n)*>(\d+) of (\d+)<\/td>/.exec($("head").html());
	votes_content_cur = parseInt(pm_counter[1], 10);
	votes_content_max = parseInt(pm_counter[2], 10);
	votes_tot_cur = parseInt(pm_counter[3], 10);
	votes_tot_max = parseInt(pm_counter[4], 10);
	votes_content_promised = 0;
	votes_content_action = false;
	votes_content_processing = false;
	votes_content_gathering = false;
	content_to_vote = [];
	ucontent_to_vote = [];
	var options_save_apply_timer;
	var tot_add_votes = getRandomInt(tot_add_votes_min, tot_add_votes_max);

	// initialize UI
	setTimeout(function() {
		$("div.toast-header").append('<div class="awah-ui-overlay"><span class="awah-arp-status awah-grey"></span><span class="awah-arp-pts"><span class="awah-arp-pts-con"></span><span class="awah-arp-pts-tot"></span></span></div>');
		if (votes_content_cur < votes_content_max) {
			$('<span class="awah-con-queue" style="display: none;">votes queue: <span class="awah-con-queue-length">' + content_to_vote.length + '</span></span>').appendTo(".awah-arp-status");
		}
		arp_pts_status_update();
		$("div.toast-body > p.text-center").css({ "float": "right", "padding-right": "16px" });
		$("div.toast-body").append('<p class="awah-options-btn"><span class="fa fa-cog"></span> HELPER OPTIONS</p>');
		$("div.toast-body").prepend('<div class="awah-options-overlay" style="display: none; bottom: -102%;"><div class="awah-option"><span class="awah-opt-desc awah-grey">AWA helper v<b>' + version + '</b></span></div>' +
			'<div class="awah-option">' +
			'<label><span class="awah-opt-title">actions_delay_min</span><input id="awah_actions_delay_min" class="form-control awah-opt-input" type="text" value="' + actions_delay_min + '"></label>' +
			'<label><span class="awah-opt-title">actions_delay_max</span><input id="awah_actions_delay_max" class="form-control awah-opt-input" type="text" value="' + actions_delay_max + '"></label>' +
			'<span class="awah-opt-desc awah-grey">Minimum and maximum random delay time between net actions. (in milliseconds)<br>Default minimum: ' + actions_delay_min_default + ' || Default maximum: ' + actions_delay_max_default + '</span></div>' +

			'<div class="awah-option">' +
			'<label><span class="awah-opt-title">tot_add_votes_min</span><input id="awah_tot_add_votes_min" class="form-control awah-opt-input" type="text" value="' + tot_add_votes_min + '"></label>' +
			'<label><span class="awah-opt-title">tot_add_votes_max</span><input id="awah_tot_add_votes_max" class="form-control awah-opt-input" type="text" value="' + tot_add_votes_max + '"></label>' +
			'<span class="awah-opt-desc awah-grey">Minimum and maximum random additional "This or That" votes.<br>Default minimum: ' + tot_add_votes_min_default + ' || Default maximum: ' + tot_add_votes_max_default + '</span></div>' +

			'<div class="awah-option">' +
			'<label><span class="awah-opt-title">show_key_on_marked_giveaways</span><input id="awah_show_key_on_marked_giveaways" class="form-control awah-opt-input" type="checkbox" ' + (show_key_on_marked_giveaways ? 'checked' : '') + '><div class="form-control awah-opt-input"><div>&nbsp;</div>&nbsp;</div></label>' +
			'<span class="awah-opt-desc awah-grey">At Giveaways page. Default: ' + (show_key_on_marked_giveaways_default === "true" ? 'ON' : 'OFF') + '</span></div>' +

			'<div class="awah-option">' +
			'<label><span class="awah-opt-title">status_message_delay</span><input id="awah_status_message_delay" class="form-control awah-opt-input" type="text" value="' + status_message_delay + '"></label>' +
			'<span class="awah-opt-desc awah-grey">How long the status messages will be displayed before they disappear. (in milliseconds, 1000 = 1 second)<br>Default: ' + status_message_delay_default + '</span></div>' +

			'<div class="awah-option">' +
			'<button id="awah_restore_default" class="btn btn-danger"><span class="fa fa-exclamation-triangle"></span> Restore default</button>' +
			'<span class="awah-opt-desc awah-grey">Restore default settings</span></div>' +
			'</div>');
		show_daily_reset_timer();

		document.addEventListener('animationend', function(event) {
			if (event.animationName == "awah-casper-out") {
				$(event.target).remove();
			}
		}, false);

		$("input.awah-opt-input").on("input", function() {
			if($(this).prop('type') == 'text') {
				this.value=this.value.replace(/[^\d]/,'');
				this.value=this.value.slice(0, 5);
			}
			clearTimeout(options_save_apply_timer);
			options_save_apply_timer = setTimeout(function() {
				options_save_apply();
			}, 400);
		});

		$("#awah_restore_default").on("click", function() {
			$("#awah_actions_delay_min").val(actions_delay_min_default);
			$("#awah_actions_delay_max").val(actions_delay_max_default);
			$("#awah_tot_add_votes_min").val(tot_add_votes_min_default);
			$("#awah_tot_add_votes_max").val(tot_add_votes_max_default);
			$("#awah_show_key_on_marked_giveaways").prop("checked", (show_key_on_marked_giveaways_default === "true"));// true);
			$("#awah_status_message_delay").val(status_message_delay_default);
			$('<span>Default options settings restored!</span>').appendTo(".awah-arp-status")
				.delay(status_message_delay).queue(function() { $(this).addClass("awah-casper-out"); });
			options_save_apply();
		});

		$(".awah-options-btn").on("click", function() {
			//$( ".block" ).animate({ left: "+=100px" }, 2000 );
			var awah_options = $(".awah-options-overlay");
			if(awah_options.css('display') == 'none') {
				awah_options.show();
				awah_options.stop().animate({bottom: "0%"}, 250);
			} else {
				awah_options.stop().animate({bottom: "-102%"}, 250, function() {
					$(this).hide();
				});
			}
		});
	}, 1);

	function options_save_apply() {
		actions_delay_min = parseInt($("#awah_actions_delay_min").val(), 10);
		actions_delay_max = parseInt($("#awah_actions_delay_max").val(), 10);
		tot_add_votes_min = parseInt($("#awah_tot_add_votes_min").val(), 10);
		tot_add_votes_max = parseInt($("#awah_tot_add_votes_max").val(), 10);
		show_key_on_marked_giveaways = $("#awah_show_key_on_marked_giveaways").prop("checked");
		if (path == "/ucf/Giveaway") {
			awahTemp = $('<div class="tile-chunk"></div>');
			awahTemp.appendTo(".awah-options-overlay").delay(250).queue(function() { $(this).remove(); });
		}
		status_message_delay = parseInt($("#awah_status_message_delay").val(), 10);

		try {
			//localStorage.setItem('ключ', 'значение');
			localStorage.setItem('awah_actions_delay_min', actions_delay_min);
			localStorage.setItem('awah_actions_delay_max', actions_delay_max);
			localStorage.setItem('awah_tot_add_votes_min', tot_add_votes_min);
			localStorage.setItem('awah_tot_add_votes_max', tot_add_votes_max);
			localStorage.setItem('awah_show_key_on_marked_giveaways', show_key_on_marked_giveaways.toString());
			localStorage.setItem('awah_status_message_delay', status_message_delay);
			$('<span>Settings saved! <span class="fa fa-floppy-o"></span></span>').appendTo(".awah-arp-status")
				.delay(status_message_delay).queue(function() { $(this).addClass("awah-casper-out"); });
		} catch (e) {
			if (e == QUOTA_EXCEEDED_ERR) {
				$('<span>localStorage quota exceeded! <span class="fa fa-exclamation-triangle"></span></span>').appendTo(".awah-arp-status")
					.delay(status_message_delay).queue(function() { $(this).addClass("awah-casper-out"); });
			}
		}
	}

	// ARP points watchdog
	$(document).ajaxComplete(function(event, xhr, settings) {
		if (settings.url.indexOf("this-or-that/vote") >=0) {
			votes_tot_cur++;
			arp_pts_status_update();
		} else if (settings.url.indexOf("vote") >=0) {
			data = JSON.parse(xhr.responseText);
			if (data.votedForContent) {
				votes_content_cur++;
			}
			if (data.votedForContent === false) {
				votes_content_cur--;
			}
			if (!votes_content_processing && !votes_content_gathering && 6 == 9) {
				$('<span>' + data.message + '</span>').appendTo(".awah-arp-status")
					.delay(status_message_delay).queue(function() { $(this).addClass("awah-casper-out"); });
				if (typeof data.voteTotal !== 'undefined') {
					$('<span>up: ' + data.upVotes + ' | down: ' + data.downVotes + ' | total: ' + data.voteTotal + '</span>').appendTo(".awah-arp-status")
						.delay(status_message_delay).queue(function() { $(this).addClass("awah-casper-out"); });
				}
			}
			arp_pts_status_update();
		}
	});

	function arp_pts_status_update() {
		$(".awah-arp-pts-con").text("CON: " + votes_content_cur + " / " + votes_content_max);
		$(".awah-arp-pts-tot").text("TOT: " + votes_tot_cur  + " / " + votes_tot_max);
		if (votes_content_cur >= votes_content_max) {
			$(".awah-arp-pts-con").addClass("awah-grey");
		}
		if (votes_tot_cur >= votes_tot_max) {
			$(".awah-arp-pts-tot").addClass("awah-grey");
		}
		if (votes_content_gathering || votes_content_processing) {
			$(".awah-arp-pts-con").css("background-image", "linear-gradient(90deg, rgb(0, 160, 240) " +
				((votes_content_cur / votes_content_max) * 100) +
				"%, rgba(0, 160, 240, 0.2) 0%, rgba(0, 160, 240, 0.2) " +
				((((votes_content_cur + content_to_vote.length) / votes_content_max) * 100) - 1) +
				"%, rgb(0, 160, 240) " +
				(((votes_content_cur + content_to_vote.length) / votes_content_max) * 100) +
				"%, rgb(40, 37, 36) 0%)");
		}
	}

	function scrl(target) {
		$('html, body').animate({scrollTop: target.offset().top-100}, 800);
		//target.effect("highlight", "800");
	}

	function getRandomInt(min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	function show_daily_reset_timer() {
		var awah_date_now = new Date();
		var awah_day_end = new Date(awah_date_now.getTime());
		awah_day_end.setUTCHours(23,59,59,999);
		var awah_day_remains = (awah_day_end.getTime() - awah_date_now.getTime());

		awah_day_remains = Math.floor(awah_day_remains / 1000);

		$(".toast-body table:first tbody").append('<tr><td><span class="fa fa-clock-o"></span> Daily reset</td><td class="text-center awah-daily-reset-timer">hh:mm:ss</td><td class="pull-right"></td></tr>');

		awah_day_remains_interval = setInterval(function() {
			awah_day_remains--;
			//var secs = Math.floor(awah_day_remains / 1000);
			var secs = awah_day_remains;
			var hours = Math.floor(secs / 3600);
			secs -= hours * (3600);
			var mins = Math.floor(secs / 60);
			secs -= mins * (60);
			if (mins < 10) mins = "0" + mins;
			if (secs < 10) secs = "0" + secs;
			$(".awah-daily-reset-timer").text(hours + ":" + mins + ":" + secs);

			if (awah_day_remains < 1000) {
				clearInterval(awah_day_remains_interval);
			}
		}, 1000);
	}

	// TOT votes section
	function this_or_that_spam() {
		if (!$("a.btn-show-vote").hasClass("hidden")) {
			$("a.btn-show-vote").click(); //turn page into voting mode
		}
		$('<span>Additional This or That votes: ' + tot_add_votes + '</span>').appendTo(".awah-arp-status")
			.delay(status_message_delay).queue(function() { $(this).addClass("awah-casper-out"); });
		//create catch event to click again
		// settings.url == /this-or-that/1516182/create-match
		// where "1516182" is a topic ID
		$(document).ajaxComplete(function(event, xhr, settings) {
			if (settings.url.indexOf("create-match") >=0 && votes_tot_cur < (votes_tot_max + tot_add_votes)) {
				setTimeout(function() {
					var tot_choice = getRandomInt(0, 1);
					$("div.vote-container a.expand").each(function(index) {
						if (index == tot_choice) {
							$(this).trigger("mouseover").delay(1000).queue(function() { $(this).click(); });
						}
					});
				}, (1000 + getRandomInt(actions_delay_min, actions_delay_max)));
			}
		});
		//$("div.vote-container a.expand").filter(":first").click(); //click to launch spam loop
		setTimeout(function() {
		var tot_choice = getRandomInt(0, 1);
			$("div.vote-container a.expand").each(function(index) {
				if (index == tot_choice) {
					$(this).trigger("mouseover").delay(1000).queue(function() { $(this).click(); });
				}
			});
		}, getRandomInt(actions_delay_min, actions_delay_max));
	}

	function this_or_that_btn() {
		$('<a class="btn btn-warning text-uppercase awah-btn-tots" href="javascript:void(0);">' +
			'<i class="fa fa-thumbs-up"></i> <span class="hidden-xs">Make TOT votes</span></a>').appendTo(".btn-group-sm");
		$(".awah-btn-tots").on("click", function() {
			$(".awah-btn-tots").addClass("hidden");
			this_or_that_spam(); //show must go on
			setTimeout(function() {
				scrl($('.this-or-that-container'));
			}, 1);
		});
	}

	// CON votes section
	function votes_content_make() {
		//$('.post-up-vote') on click
		//var postId = $(this).data('post-id');
		votes_content_processing = true;
		var url = content_to_vote.shift();
		$(".awah-con-queue-length").text(content_to_vote.length);
		//var url    = "/forums/post/up-vote/replaceMe";
		//url        = url.replace('replaceMe', postId);
		var postId = url.replace("/forums/post/up-vote/", "");

		$.ajax({
			url: url,
			type: 'post',
			success: function(data){
				if (data.success) {
                    $('.post-vote-count[data-post-id="'+postId+'"]').html(data['voteTotal']);

                    if (data.votedForContent) {
                        $('#post-'+postId+' .post-up-vote .fa-arrow-up').css('color', 'gold');
                    } else {
                        $('#post-'+postId+' .post-up-vote .fa-arrow-up').css('color', '#c8c8c8');
                    }

                    $('#post-'+postId+' .post-down-vote .fa-arrow-down').css('color', '#c8c8c8');
                }
				if (content_to_vote.length > 0 && votes_content_cur < votes_content_max) {
					setTimeout(function() {
						votes_content_make();
					}, getRandomInt(actions_delay_min, actions_delay_max));
				} else {
					arp_pts_status_update(); // just in case
					votes_content_processing = false;
					if (!votes_content_gathering) {
						$(".awah-con-queue").delay(status_message_delay).queue(function() { $(this).addClass("awah-casper-out"); });
						setTimeout(function() {
							$(".awah-arp-pts-con").css("background-image", "");
						}, status_message_delay);
						//$(".awah-arp-pts-con").delay(status_message_delay).queue(function() { $(this).css("background-image", ""); });
					}
				}
			},
			error: function(data){
				$('<span>Some vote error!</span>').appendTo(".awah-arp-status")
					.delay(status_message_delay).queue(function() { $(this).addClass("awah-casper-out"); });
				if (content_to_vote.length > 0) {
					votes_content_make();
				} else {
					votes_content_processing = false;
				}
			},
        });
	}

	function votes_content_gather() {
		votes_content_gathering = true;

		$(".awah-con-queue").show();

		// TODO: filter to avoid arrow-down arleady clicked comments
		$("i.fa-arrow-up:not([style='color: gold;'])").each(function( index ) {
			if ((votes_content_cur + content_to_vote.length) < votes_content_max) {
				var url = "/forums/post/up-vote/" + $(this).parent().attr('data-post-id');
				content_to_vote.push(url);
				$(".awah-con-queue-length").text(content_to_vote.length);
				arp_pts_status_update();
			}
			if ((votes_content_cur + content_to_vote.length) >= votes_content_max) {
				votes_content_gathering = false;
				$('<span>Enough votes!</span>').appendTo(".awah-arp-status")
					.delay(status_message_delay).queue(function() { $(this).addClass("awah-casper-out"); });
				return false;
			}
		});
		if (content_to_vote.length > 0 && !votes_content_processing) {
			votes_content_make();
		}
		if (votes_content_gathering) {
			setTimeout(function() {
				votes_content_get_next_page();
			}, getRandomInt(actions_delay_min, actions_delay_max));
		}
	}

	function votes_content_get_next_page() {
		//$('.pagination li a').on('click'
		//e.preventDefault();
		//$ele         = $(this);
		var status_message = $('<span>Getting to the next page <span class="fa fa-circle-o-notch fa-spin"></span></span>');
		status_message.appendTo(".awah-arp-status");
		var href     = $("ul.pagination > li.next:not(.disabled) > a").filter(":first").attr('href');
		var parts    = href.split('/');
		var page     = parts.pop();
		var entityId = parts.pop();

		if (href) {
			$.ajax({
				url: href,
				type: 'get',
				success: function(data) {
					status_message.html('<span>Getting to the next page <span class="fa fa-check-circle"></span></span>');
					status_message.delay(status_message_delay).queue(function() { $(this).addClass("awah-casper-out"); });
					$('#reply-wrapper').empty();
					$('#reply-wrapper').append(data);
					$('.ucf-comments .timeago').timeago();
					votes_content_gather();
				},
				error: function(data) {
					status_message.html('<span>Getting to the next page <span class="fa fa-exclamation-triangle"></span></span>');
					status_message.delay(status_message_delay).queue(function() { $(this).addClass("awah-casper-out"); });
					$(".awah-btn-cons").removeClass("hidden");
				}
			});
		} else {
			votes_content_gathering = false;
		}
	}

	function votes_content_btn() {
		$('<a class="btn btn-default awah-btn-cons" href="javascript:void(0);">' +
			'<i class="fa fa-arrow-up" style="color: gold;"></i> <span class="hidden-xs">Make CON votes</span></a>').appendTo(".btn-group-sm");
		$(".awah-btn-cons").on("click", function() {
			$(".awah-btn-cons").addClass("hidden");
			votes_content_gather(); //new algorithm
		});
	}

	// USER profile functions
	function show_user_steam_profile_link() {
		if (profileSteamId > 0) {
			// fix profileSteamId
			profileSteamId = $('a[href^="steam://friends/message/"]').prop("href").replace(/steam:\/\/friends\/message\//, "");

			$(".profile-social-links").append('<li data-steam-enabled="true"><span class="fa fa-steam-square" style=""></span> <a href="//steamcommunity.com/profiles/' + profileSteamId + '" target="_blank">Visit Steam Profile</a></li>');
		}
	}

	function show_available_keys() {
		//output prependTo(".content-container");
		//div#get-key-actions span.key-count
		if (typeof countryKeys !== 'undefined') {
			var keys_left = 0;
			var userCountryKeys = countryKeys[user_country];
			if (typeof userCountryKeys === "number") {
				keys_left = userCountryKeys;
			} else if (typeof userCountryKeys === "object") {
				for (var level in userCountryKeys) {
					if (userCountryKeys[level] > 0) {
						keys_left += userCountryKeys[level];
					}
				}
			}
			$("#giveaway-flash-message").after('<div class="well well-sm"><b>' + keys_left + '</b> keys left for <b>' + user_country + '</b> country</div>');
		}
	}

	// GIVEAWAY functions
	function get_entered_giveaways() {
		// optionally get https://eu.alienwarearena.com/account/me/giveaways
		var any_giveaway_href = $('a[href*="/Giveaway/"]:last').prop("href");
		var status_message = $('<span>Getting your giveaways info <span class="fa fa-circle-o-notch fa-spin"></span></span>');
		setTimeout(function() {
			status_message.appendTo(".awah-arp-status");
		}, 1);
		$.ajax({
			url: any_giveaway_href,
			type: 'get',
			success: function(data) {
				status_message.html('<span>Getting your giveaways info <span class="fa fa-check-circle"></span></span>');
				status_message.delay(status_message_delay).queue(function() { $(this).addClass("awah-casper-out"); });
				var awahdata = /var giveawayKeys.*\[({.*})\];/.exec(data);
				awahdata = awahdata[1];
				awahdata = awahdata.replace(/},{/g, "}awahsplitmark,{");
				awahdata = awahdata.split("awahsplitmark,");
				var awahGiveawayKeys = [];
				$.each(awahdata, function( index, value ) {
					//awahGiveawayKeys.push(JSON.parse(value));
					var parsed_value = JSON.parse(value);
					awahGiveawayKeys[parsed_value.giveaway_id] = parsed_value;
				});
				awahdata = null;
				if(DEBUG) console.log(awahGiveawayKeys);
				// sometimes first giveaways page loaded before event registered !
				mark_entered_giveaways(awahGiveawayKeys);
				document.addEventListener('animationstart', function(event) {
					if (event.animationName == "awah-new-tile-chunk-appears") {
						mark_entered_giveaways(awahGiveawayKeys);
					}
				}, false);
			},
			error: function(data) {
				status_message.html('<span>Getting your giveaways info <span class="fa fa-exclamation-triangle"></span></span>');
				status_message.delay(status_message_delay).queue(function() { $(this).addClass("awah-casper-out"); });
				//$(".awah-btn-cons").removeClass("hidden");
			}
		});
	}

	function mark_entered_giveaways(awahGiveawayKeys) {
		$("a.Giveaway").each(function() {
			var awahGiveawayID = /\/ucf\/show\/([\d]+)/.exec($(this).prop("href"));
			awahGiveawayID = awahGiveawayID[1];
			if (typeof awahGiveawayKeys[awahGiveawayID] === "object") {
				$(this).parent().addClass("awah-giveaway-taken");
				awahlabel = '✔\nTAKEN AT: ' + awahGiveawayKeys[awahGiveawayID].assigned_at;
				if (show_key_on_marked_giveaways) awahlabel += '\n            KEY: ' + awahGiveawayKeys[awahGiveawayID].value;
				$(this).attr("awahlabel", awahlabel);
			}
		});
	}

	switch (true) {
		case /.*\/ucf\/show\/.*/.test(path):
			if(DEBUG) console.log("SWITCH: Content");
			if (/.*\/boards\/this-or-that\/.*/.test(path)) {
				if(DEBUG) console.log("SWITCH: This or That");
				this_or_that_btn();
			}
			if (/^\/ucf\/show\/.*\/Giveaway\/.*$/.test(path)) {
				if(DEBUG) console.log("SWITCH: Giveaway");
				show_available_keys();
			}
			votes_content_btn();
			break;
		case /^\/ucf\/Giveaway$/.test(path):
			if(DEBUG) console.log("SWITCH: Giveaways list");
			get_entered_giveaways();
			break;
		case /^\/member\/.*$/.test(path):
			if(DEBUG) console.log("SWITCH: user profile page");
			show_user_steam_profile_link();
			break;
		case /\/$/.test(url):
			if(DEBUG) console.log("SWITCH: main page");
			break;
	}

	// Embed functions to be called directly from the UI in *-monkey installations
	function embedFunction(s) {
		if(DEBUG) console.log('🔀 embedding: ' + s.name);
		document.body.appendChild(document.createElement('script')).innerHTML=s.toString().replace(/([\s\S]*?return;){2}([\s\S]*)}/,'$2');
	}

	// embed other functions used by UI after loading
	embedFunction(scrl);

}(window));
