if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js', { scope: '/' }).then(function() {
        console.log('success');
    }).catch(function(e) {
        console.log(e);
    });
}
