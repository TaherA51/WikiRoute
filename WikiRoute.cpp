#pragma once
#
#include "WikiRoute.h"

using namespace std;

// Unfinished, pending api
void WikiRoute::addSite(string from){
    sites.insert(from);
}

// Unfinished, pending api
void WikiRoute::addLink(string from, string to){
    adjList[from].insert(to);
}

void WikiRoute::fixWeights() {
    for (const string& from : sites) {
        for (const string& to : adjList[from]) {
            if (adjList[to].find(from) != adjList[to].end()) {
                weights[from+to] = 1;
            } else {
                weights[from+to] = 2;
            }
        }
    }
}


string WikiRoute::closest(unordered_set<string>finished, unordered_map<string, int> dist) {
    int minDist = 1e6+1;
    string minName;

    for (string site : sites) {
        if (finished.find(site) == finished.end() && dist[site] < minDist) {
            minDist = dist[site];
            minName = site;
        }
    }

    return minName;
}

vector<string> WikiRoute::recoverChain(string to, unordered_map<string, int> dist, unordered_map<string, string> parent) {
    vector<string> output;
    string curr = to;

    while (parent[curr] != "thisisfrom") {
        output.insert(output.begin(), curr);
        curr = parent[curr];
    }
    output.insert(output.begin(), curr);

    return output;
}

vector<string> WikiRoute::dijkstra(string from, string to) {
    unordered_map<string, int> dist;
    unordered_map<string, string> parent;
    unordered_set<string> finished;

    for (string site : sites) {
        dist[site] = 1e6;
    }
    dist[from] = 0;
    parent[from] = "thisisfrom";

    while (finished.find(to) == finished.end()) {
        string curr = closest(from, finished, dist);
        finished.insert(curr);

        for (string tempTo : adjList[curr]) {
            if (dist[curr] + weights[curr+tempTo] < dist[tempTo]) {
                dist[tempTo] = dist[curr] + weights[curr+tempTo];
                parent[tempTo] = curr;
            }
        }
    }

    return recoverChain(to, dist, parent);
}