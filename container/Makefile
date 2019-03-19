build:
	mkdir -p files
	cp -af ../bomreader files/
	docker build -t bomreader .

clean:
	rm -rf files/

run:
	docker run -d --name bomreader -p 1080:1080 --restart=always bomreader
