#pragma once
#
#include "WikiRoute.h"
#include "helpers.h"

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


string WikiRoute::closest(string from, unordered_set<string>finished, unordered_map<string, int> dist) {
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

// Unfinished but should be finished soon
vector<string> WikiRoute::dijkstra(string from, string to) {
    unordered_map<string, int> dist;
    unordered_map<string, string> parent;
    unordered_set<string> finished;

    for (string site : sites) {
        
    }

    return recoverChain(to, dist, parent);
}