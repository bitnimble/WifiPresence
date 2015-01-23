while true
do
	echo 'Beginning new poll.'
	#Start kismet server and sniff for 10 minutes
	sudo kismet_server --no-logging 1> /dev/null 2> /dev/null &
	sleep 1m

	#Then grab the data and push it to winter
	./poll.sh
	
	#Then kill the server start again
	sudo killall kismet_server
done



