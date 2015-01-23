#echo 'Sniffing for 10 seconds...'
#kismet_server > /dev/null &

#sleep 10

echo 'Finished. Collecting data...'

macs=`echo -e '!0 ENABLE CLIENT MAC' | nc localhost 2501 | grep '*CLIENT: ' | cut -d " " -f 2 | sort | uniq -u`

echo '------------------------'
echo $macs
echo '------------------------'

IFS=$'\n'

echo 'Pushing to mosquitto...'
for msg in $macs
do
	mosquitto_pub -h winter.ceit.uq.edu.au -t wifipresencedb -m "$msg"
done
echo 'Done.'

