const fs = require('fs');
const { exec, spawn } = require('child_process');

function delay(ms) { return new Promise(resolve => setTimeout(resolve, ms));}
function readConfig( settingsFile ) {
    return new Promise( resolve => {
        var config = undefined;
        try { config = JSON.parse( fs.readFileSync( settingsFile ) );}
        catch (_) { config = undefined; }
        resolve( config );
    });
}

function logInfo( log, toSyslog = true ) {
    
    return new Promise( resolve => {
        console.log( log );
        if( toSyslog ) exec( `logger -s "AIRA AI MEDIA CONNECTOR : ${log}"` );
        resolve();
    });
}

let _runServiceLoop = false;
global.startService = function( a, b ) { _runServiceLoop = true; serviceLoop( a, b ); }
global.stopService = function () { _runServiceLoop = false; }
async function serviceLoop( swRoot, settingsFile ) {
    var configHasBeenChanged = false;
    fs.watchFile( settingsFile, async (curr, prev) => {
        configHasBeenChanged = true;
    });

    while( _runServiceLoop ) {
        const allConfigs = await readConfig( settingsFile );
        if( allConfigs == undefined ) {
            await delay( 5000 );
            continue;
        }
        configHasBeenChanged = false;

        const runnungClients = [];
        if( Array.isArray( allConfigs ) ) {
            logInfo( `starting ${allConfigs.length} processes.` );

            for( let i = 0; i < allConfigs.length; i++ ) {
                var config = allConfigs[i];
                if( config["show_video"] ) delete config["show_video"];

                const client = spawn( `${swRoot}/aiMediaConnector`, [ JSON.stringify(config) ]);
                runnungClients.push( client );
                await delay( 100 );
            }
            logInfo( `${allConfigs.length} processes started.` );
            // allConfigs.forEach( config => {
            //     if( config["show_video"] ) delete config["show_video"];
            //     const client = spawn( `${swRoot}/aiMediaConnector`, [ JSON.stringify(config) ]);
            //     runnungClients.push( client );
            // });
        }
        while( _runServiceLoop && configHasBeenChanged == false ) await delay( 5000 );

        if( configHasBeenChanged ) logInfo( `config changed.` );
        if( _runServiceLoop ) logInfo( `stopping service.` );
        logInfo( `stopping ${runnungClients.length} processes.` );

        while( runnungClients.length > 0 ) {
            const client = runnungClients.shift();
            exec( `kill -9 ${client.pid}` );
            await delay( 100 );
        }
        logInfo( `${runnungClients.length} processes stopped.` );
        await delay( 5000 );
    }
    fs.unwatchFile( settingsFile );
}

var swRoot = "./";
var settingsFile = "./camerasettings.db";
process.argv.forEach( argc => {
    var param = argc.split("=");
    if( param.length == 2 ) {
        switch( param[0] ) {
            case "swRoot" : {
                swRoot = param[1];
            } break;
            case "settingsFile" : {
                settingsFile = param[1];
            } break;
        }
    }
});
global.startService( swRoot, settingsFile );

