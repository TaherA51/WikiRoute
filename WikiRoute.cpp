#pragma once
#
#include "WikiRoute.h"

using namespace std;

void WikiRoute::addSite(string from){
    sites.insert(from);
}

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