module.exports = function(RED) {
    'use strict';
    var nfcpyid = require('node-nfcpy-id').default;
    function nfcpyidNode(n) {
        RED.nodes.createNode(this,n);
        this.waitTime = n.waitTime * 1000;
        var tmp_card_id   = '';
        var tmp_card_type = '';
        var node = this;
        var nfc = new nfcpyid().start();
        this.status({fill:"green",shape:"ring",text:"waiting"});
        nfc.on('touchstart', (card) => { 
            try{
                this.status({fill:"green",shape:"dot",text:"touched"});
                setTimeout(() =>{
                    nfc.start();
                    this.status({fill:"green",shape:"ring",text:"waiting"});
                },node.waitTime);

                var msg = {
                    'payload': card.id,
                    'type': card.type,
                    'status' : 1,
                    'timestamp': Date.now()
                };
                tmp_card_id = card.id;
                tmp_card_type = card.type;
                node.send(msg);
            }catch(err){
                console.log("touch error");
                restart_nfc();
            }
        });

        nfc.on('touchend', () => {
            try{
                this.status({fill:"green",shape:"dot",text:"touchend"});

                var msg = {
                    'payload': tmp_card_id,
                    'type': tmp_card_type,
                    'status' : 0,
                    'timestamp': Date.now()
                };
                
                node.send(msg);
            }catch(err){
                console.log("touchend error");
                restart_nfc();
            }
            tmp_card_id = '';
            tmp_card_type = '';
        });
          
        nfc.on('error', (err) => {
            console.error('\u001b[31m', err, '\u001b[0m');
            tmp_card_id = '';
            tmp_card_type = '';
        });

        node.on('close',function(){
            nfc.pause();
            tmp_card_id = '';
            tmp_card_type = '';
        });
    }
    RED.nodes.registerType("nfcpy-id",nfcpyidNode);


    function restart_nfc(){
        console.log("nfcerror and restartnfc");
        tmp_card_id = '';
        tmp_card_type = '';
        nfc.pause();
        nfc.start();
    }
}
