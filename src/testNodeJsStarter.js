let app = spawn('python', [__dirname + './src/updateDisplay.py', actSlideImg])

app.stdout.on('data', (data) => {
    console.log(`child stdout: ${data}`);
});

app.stderr.on('data', (data) => {
    console.error(`child stderr:\n${data}`);
});