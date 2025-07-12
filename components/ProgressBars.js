import React from 'react';
import {View, Animated, StyleSheet} from 'react-native';

const ProgressBars = ({stories, currentIndex, userStoryGroups, progress, insets}) => {

  const currentStory = stories[currentIndex];
  if (!currentStory) return null;

  const userGroup = userStoryGroups.find(
    group => group.user.id === currentStory.user.id,
  );
  if (!userGroup) return null;

  return (
    <View style={[styles.progressBarsWrapper, {paddingTop: insets.top + 5}]}>
      <View style={styles.progressGroup}>
        {userGroup.stories.map((story, idx) => {
          const globalIndex = stories.findIndex(s => s.id === story.id);
          return (
            <View key={story.id || idx} style={styles.progressBarBackground}>
              <Animated.View
                style={[
                  styles.progressBar,
                  globalIndex === currentIndex
                    ? {
                        width: progress.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0%', '100%'],
                        }),
                      }
                    : globalIndex < currentIndex
                    ? {width: '100%'}
                    : {width: '0%'},
                ]}
              />
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  progressBarsWrapper: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    zIndex: 10,
  },
  progressGroup: {
    flexDirection: 'row',
  },
  progressBarBackground: {
    flex: 1,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: 1,
  },
  progressBar: {
    height: 2,
    backgroundColor: 'white',
  },
});

export default ProgressBars;
