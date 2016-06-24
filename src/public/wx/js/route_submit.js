$(document).ready(function(){
	$('#btn-submit').click(function(){
		var src = $('#src').val();
		var dest = $('#dest').val();
		if (src.length < 4 || src.length > 200 || dest.length < 4 || dest.length > 200) {
			alert('地址填写有误！');
			return;
		}  
		simplePost('/api/uncheckedRoute/create', {
			src: src,
			dest: dest
		}, function() {
			alert('路线提交成功！');
		});
	})
});
