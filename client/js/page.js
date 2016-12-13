const CONFIG = require('./config.json');
const clientSocket = io.connect(`/${CONFIG.SECRET_CODE}/client`);

clientSocket.on('trackChange', function(html){
    const oldNode = document.querySelector('.current-track');
    const newNode = document.createElement('div');
    newNode.innerHTML = html;
    oldNode.parentNode.replaceChild(newNode.children[0], oldNode);
});
