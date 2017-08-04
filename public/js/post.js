/*
* 操作页面中的帖子
* 	展开和收缩留言
* */



$(window).ready(function () {

// 打开和收缩留言
var $reply        = $('.reply');                // 留言页面
var $replyDefault = $('.default');              // 加载评论动画
var $replyButton  = $('.reply-button');         // 开关按钮
var $replyWrap    = $('.reply-wrap');           // 放评论的
var replyModel    = $('#replyTemplate').html(); // 评论模块

$replyButton.on('click', function () {
	this.off = !this.off;  // 看看是展开还是收缩

	var $This = $(this);
	var height = $This.offset().top - 130;

	$('html,body').animate({scrollTop: height}, 300);

	var index = $replyButton.index($This);
	if (this.off) {
		$reply.eq(index).css('display', 'block');
	} else {
		$reply.eq(index).css('display', 'none');
	}
	if (!this.one) {
		this.one = true;       // 记录是否第一次点击
		var topicId = $This.attr('data-topic-id');
		getReply(topicId, function (err, msg) {
			if (err || msg.states < 1) {
				return hint('服务器错误!');
			}
			if (msg.states === 1) {
				var data = msg.data;
				var temp = '';
				for (var i = 0; i < data.length; i++) {
					temp +=
						replyModel.replace('[name]', data[i].name).
						replace('[avatar]', data[i].avatar).
						replace('[text]', data[i].content).
						replace('[like]', data[i].like_count).
						replace('[floor]', data[i].floor).
						replace('[_id]', data[i]._id);
				}
			}

			$replyDefault.eq(index).css('display', 'none');
			$replyWrap.eq(index).append(temp);
		});
	}

});


// 喜欢
var $likeButton = $('.like');
var $likeIcon   = $('.like i');
var $likeCount  = $('.like em');
$likeButton.on('click', function () {
	if (!window.login_state) {
		return hint('要登陆后才能点赞啦!');
	}
	var $This = $(this);
	if (parseInt($This.attr('liked')) === 1) {
		return;
	}

	var index = $likeButton.index($This);
	$This.css({'backgroundColor': '#eff3f5', 'color': '#3498DB'});
	$This.attr('liked', '1');
	like($This.attr('data-topic-id'), function (err, msg) {
		if (err || msg.states < 1) {
			hint(msg.hint);
		}
	});

	$likeCount.eq(index).css('color', '#3498DB');
	$likeCount.eq(index).html(parseInt($likeCount.eq(index).html()) + 1);
	$likeIcon.eq(index).html('&#xe60a;');
	$likeIcon.eq(index).css({
		'color': '#FF6161',
		'animation': 'like .6s ease',
		'-webkit-animation': 'like .6s ease',
		'textShadow': '0 0 5px #ff7ebc'
	})
});

// 评论留言
var $replyBnt = $('.comment-bnt');

$replyBnt.on('click', function () {
	if (!window.login_state) {
		return hint('登陆后才可以评论哦!');
	}
	var index = $replyBnt.index(this);
	var $replyContent = $('.comment-content').eq(index);
	if ($replyContent.val().length < 1 || $replyContent.val().length > 150) {
		return hint('评论字数不能为空或大于150!');
	}
	addReply($replyContent.attr('data-topic-id'), $replyContent.val(), function (err, msg) {
		if (err) return hint('服务器错误!');
		hint(msg.hint);
		var temp =
			replyModel.replace('[name]', window.user_info.loginname).
			replace('[avatar]', window.user_info.avatar).
			replace('[text]', filterTag($replyContent.val())).
			replace('[like]', 0).
			replace('[floor]','n').
			replace('[_id]', msg._id);
		$replyWrap.eq(index).append(temp.toString());
		$replyContent.val('');
	});
});



});
