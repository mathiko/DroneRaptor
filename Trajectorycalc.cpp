//#include stdio.h
#include <iostream>
#include <cstdio>
using namespace std;



int main(int argc, char *argv[])
{
	int duration = atoi(argv[1]);
	double startlat = atof(argv[2]);
	double startlong = atof(argv[3]);
	double endlat = atof(argv[4]);
	double endlong = atof(argv[5]);
	double time = 0;
	double alt = 99;

	double dlat = (endlat - startlat)/(duration*10);
	double dlong = (endlong - startlong)/(duration*10);

	double lat = startlat;
	double lon = startlong;

	FILE* fpt;
	fpt = fopen("Trajectory.csv", "w+");
	//fprintf(fpt, "time, lat, lon\n");

	while (time <= duration)
	{
		//cout << time << " " << lat << " " << lon << "\n";
		fprintf(fpt, "%lf, %lf, %lf, %lf\n", time, lat, lon, alt);
		lat += dlat;
		lon += dlong;
		time += 0.1;
	}
	fclose(fpt);
	return 0;
}
