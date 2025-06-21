import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { COLORS, SIZES, icons } from '../constants'
import AntDesign from "react-native-vector-icons/AntDesign"
import Header from '../components/Header'
import { LineChart } from 'react-native-chart-kit'
import * as Progress from 'react-native-progress';
import DataCard from '../components/DataCard'
import { ScrollView } from 'react-native-virtualized-view'

const data = {
  labels: ['January', 'February', 'March', 'April', 'May', 'June'],
  datasets: [
    {
      data: [20, 45, 28, 80, 99, 43],
      color: (opacity = 1) => `rgba(20, 194, 105, ${opacity})`, // Green color for the line
      strokeWidth: 2, // Line width
    },
  ],
};

const statsData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [
    {
      data: [20, 45, 28, 80, 99, 43],
      color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`, // Line color
      strokeWidth: 2, // Line width
    },
  ],
};

const Dashboard = () => {
  const [selectedTab, setSelectedTab] = useState('overview');

  const chartConfig = {
    backgroundGradientFrom: '#fff',
    backgroundGradientTo: '#fff',
    decimalPlaces: 2, // number of decimal places
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    style: {
      borderRadius: 16,
    },
  };

  const statsChartConfig = {
    backgroundGradientFrom: '#fff',
    backgroundGradientTo: '#fff',
    decimalPlaces: 2, // number of decimal places
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
  };


  const renderTabContent = () => {
    switch (selectedTab) {
      case 'overview':
        return (
          <View>
            <View style={styles.reviewContent}>
              <View style={styles.reviewCard}>
                <Text style={styles.reviewAmount}>+$55,000</Text>
                <Text style={styles.reviewName}>Income</Text>
                <View style={{ marginTop: 12 }}>
                  <Progress.Bar
                    progress={0.3}
                    width={106}
                    color={COLORS.green}
                    unfilledColor={COLORS.white}
                  />
                </View>
              </View>
              <View style={styles.reviewCard}>
                <Text style={styles.reviewAmount}>-$170,00</Text>
                <Text style={styles.reviewName}>Expenses</Text>
                <View style={{ marginTop: 12 }}>
                  <Progress.Bar
                    progress={0.7}
                    width={106}
                    color="#F6316C"
                    unfilledColor={COLORS.white}
                  />
                </View>
              </View>
              <View style={styles.reviewCard}>
                <Text style={styles.reviewAmount}>$150,00</Text>
                <Text style={styles.reviewName}>Saving</Text>
                <View style={{ marginTop: 12 }}>
                  <Progress.Bar
                    progress={0.9}
                    width={106}
                    color={COLORS.purple}
                    unfilledColor={COLORS.white}
                  />
                </View>
              </View>
            </View>
            <View style={styles.statsCard}>
              <LineChart
                data={statsData}
                width={SIZES.width - 32}
                height={340}
                yAxisLabel={'$'}
                chartConfig={{
                  backgroundGradientFrom: '#fff',
                  backgroundGradientTo: '#fff',
                  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  style: {
                    borderRadius: 16,
                  },
                  propsForDots: {
                    r: '6',
                    strokeWidth: '2',
                    stroke: COLORS.primary,
                  },
                }}
                bezier
                style={{
                  marginVertical: 8,
                  borderRadius: 16,
                }}
              />
            </View>
          </View>
        );
      case 'days':
        return (
          <View>
          <View style={styles.reviewContent}>
            <View style={styles.reviewCard}>
              <Text style={styles.reviewAmount}>+$5,100</Text>
              <Text style={styles.reviewName}>Income</Text>
              <View style={{ marginTop: 12 }}>
                <Progress.Bar
                  progress={0.7}
                  width={106}
                  color={COLORS.green}
                  unfilledColor={COLORS.white}
                />
              </View>
            </View>
            <View style={styles.reviewCard}>
              <Text style={styles.reviewAmount}>-$17,00</Text>
              <Text style={styles.reviewName}>Expenses</Text>
              <View style={{ marginTop: 12 }}>
                <Progress.Bar
                  progress={0.8}
                  width={106}
                  color="#F6316C"
                  unfilledColor={COLORS.white}
                />
              </View>
            </View>
            <View style={styles.reviewCard}>
              <Text style={styles.reviewAmount}>$120,00</Text>
              <Text style={styles.reviewName}>Saving</Text>
              <View style={{ marginTop: 12 }}>
                <Progress.Bar
                  progress={0.7}
                  width={106}
                  color={COLORS.purple}
                  unfilledColor={COLORS.white}
                />
              </View>
            </View>
          </View>
          <View style={styles.statsCard}>
            <LineChart
              data={statsData}
              width={SIZES.width - 32}
              height={340}
              yAxisLabel={'$'}
              chartConfig={{
                backgroundGradientFrom: '#fff',
                backgroundGradientTo: '#fff',
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
                propsForDots: {
                  r: '6',
                  strokeWidth: '2',
                  stroke: COLORS.purple,
                },
              }}
              bezier
              style={{
                marginVertical: 8,
                borderRadius: 16,
              }}
            />
          </View>
        </View>
        );
      case 'months':
        return (
          <View>
          <View style={styles.reviewContent}>
            <View style={styles.reviewCard}>
              <Text style={styles.reviewAmount}>+$11,000</Text>
              <Text style={styles.reviewName}>Income</Text>
              <View style={{ marginTop: 12 }}>
                <Progress.Bar
                  progress={0.3}
                  width={106}
                  color={COLORS.green}
                  unfilledColor={COLORS.white}
                />
              </View>
            </View>
            <View style={styles.reviewCard}>
              <Text style={styles.reviewAmount}>-$100,00</Text>
              <Text style={styles.reviewName}>Expenses</Text>
              <View style={{ marginTop: 12 }}>
                <Progress.Bar
                  progress={0.6}
                  width={106}
                  color="#F6316C"
                  unfilledColor={COLORS.white}
                />
              </View>
            </View>
            <View style={styles.reviewCard}>
              <Text style={styles.reviewAmount}>$190,00</Text>
              <Text style={styles.reviewName}>Saving</Text>
              <View style={{ marginTop: 12 }}>
                <Progress.Bar
                  progress={0.5}
                  width={106}
                  color={COLORS.purple}
                  unfilledColor={COLORS.white}
                />
              </View>
            </View>
          </View>
          <View style={styles.statsCard}>
            <LineChart
              data={statsData}
              width={SIZES.width - 32}
              height={340}
              yAxisLabel={'$'}
              chartConfig={{
                backgroundGradientFrom: '#fff',
                backgroundGradientTo: '#fff',
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
                propsForDots: {
                  r: '6',
                  strokeWidth: '2',
                  stroke: COLORS.primary,
                },
              }}
              bezier
              style={{
                marginVertical: 8,
                borderRadius: 16,
              }}
            />
          </View>
        </View>
        );
      case 'years':
        return (
          <View>
          <View style={styles.reviewContent}>
            <View style={styles.reviewCard}>
              <Text style={styles.reviewAmount}>+$155,000</Text>
              <Text style={styles.reviewName}>Income</Text>
              <View style={{ marginTop: 12 }}>
                <Progress.Bar
                  progress={0.3}
                  width={106}
                  color={COLORS.green}
                  unfilledColor={COLORS.white}
                />
              </View>
            </View>
            <View style={styles.reviewCard}>
              <Text style={styles.reviewAmount}>-$120,00</Text>
              <Text style={styles.reviewName}>Expenses</Text>
              <View style={{ marginTop: 12 }}>
                <Progress.Bar
                  progress={0.7}
                  width={106}
                  color="#F6316C"
                  unfilledColor={COLORS.white}
                />
              </View>
            </View>
            <View style={styles.reviewCard}>
              <Text style={styles.reviewAmount}>$130,00</Text>
              <Text style={styles.reviewName}>Saving</Text>
              <View style={{ marginTop: 12 }}>
                <Progress.Bar
                  progress={0.9}
                  width={106}
                  color={COLORS.purple}
                  unfilledColor={COLORS.white}
                />
              </View>
            </View>
          </View>
          <View style={styles.statsCard}>
            <LineChart
              data={statsData}
              width={SIZES.width - 32}
              height={340}
              yAxisLabel={'$'}
              chartConfig={{
                backgroundGradientFrom: '#fff',
                backgroundGradientTo: '#fff',
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
                propsForDots: {
                  r: '6',
                  strokeWidth: '2',
                  stroke: COLORS.primary,
                },
              }}
              bezier
              style={{
                marginVertical: 8,
                borderRadius: 16,
              }}
            />
          </View>
        </View>
        );
      default:
        return null;
    }
  };


  return (
    <SafeAreaView style={styles.area}>
      <View style={styles.container}>
        <Header title="Dashboard" />
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Render Balance Card */}
          <View style={styles.balanceCard}>
            <View style={{
              flexDirection: "column",
              justifyContent: "space-between"
            }}>
              <View>
                <Text style={styles.balanceAmount}>$380.254</Text>
                <Text style={styles.balanceText}>Balance</Text>
              </View>
              <View style={{ flexDirection: "row" }}>
                <AntDesign
                  name="arrowdown"
                  size={14}
                  color={COLORS.green}
                />
                <Text style={styles.balancePercent}>29.328%</Text>
              </View>
            </View>
            <View style={{ marginBottom: 24 }}>
              <LineChart
                data={data}
                width={SIZES.width - 100}
                height={100}
                yAxisLabel="$"
                chartConfig={chartConfig}
                withHorizontalLabels={false}
                withInnerLines={false}
                withDots={false}
                withVerticalLabels={false}
                withVerticalLines={false}
                withHorizontalLines={false}
                bezier
                style={{
                  marginVertical: 8,
                  borderRadius: 16,
                }}
              />
            </View>
          </View>
          {/* Render Data Card */}
          <View style={styles.dataCardContainer}>
            <DataCard
              percentage={60}
              radius={30}
              ticketType="VIP Ticket"
              numSold={120}
              color={COLORS.primary}
            />
            <DataCard
              percentage={100}
              radius={30}
              ticketType="Regular Ticket"
              numSold={120}
              color="#F6316C"
            />
            <DataCard
              percentage={70}
              radius={30}
              ticketType="Premium Ticket"
              numSold={120}
              color="#FD7E14"
            />
          </View>
          {/* Render Analytics Tab */}
          <View style={styles.tabContainer}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginVertical: 16 }}>
              <TouchableOpacity
                onPress={() => setSelectedTab('overview')}
                style={[
                  styles.btnContainer,
                  { backgroundColor: selectedTab === "overview" ? COLORS.primary : COLORS.gray6 }
                ]}>
                <Text style={[styles.btnText, {
                  color: selectedTab === "overview" ? COLORS.white : COLORS.black
                }]}>Overview</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setSelectedTab('days')}
                style={[
                  styles.btnContainer,
                  { backgroundColor: selectedTab === "days" ? COLORS.primary : COLORS.gray6 }
                ]}>
                <Text style={[styles.btnText, {
                  color: selectedTab === "days" ? COLORS.white : COLORS.black
                }]}>Days</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setSelectedTab('months')}
                style={[
                  styles.btnContainer,
                  { backgroundColor: selectedTab === "months" ? COLORS.primary : COLORS.gray6 }
                ]}>
                <Text style={[styles.btnText, {
                  color: selectedTab === "months" ? COLORS.white : COLORS.black
                }]}>Months</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setSelectedTab('years')}
                style={[
                  styles.btnContainer,
                  { backgroundColor: selectedTab === "years" ? COLORS.primary : COLORS.gray6 }
                ]}>
                <Text style={[styles.btnText, {
                  color: selectedTab === "years" ? COLORS.white : COLORS.black
                }]}>Years</Text>
              </TouchableOpacity>

            </View>
            {renderTabContent()}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  area: {
    flex: 1,
    backgroundColor: COLORS.secondaryWhite
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.secondaryWhite,
    padding: 16
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  balanceCard: {
    height: 132,
    width: SIZES.width - 32,
    backgroundColor: COLORS.white,
    borderRadius: 14,
    marginTop: 20,
    flexDirection: "row",
    paddingVertical: 24,
    paddingHorizontal: 16
  },
  balanceAmount: {
    fontSize: 18,
    fontFamily: "Roboto Bold",
    color: COLORS.primary
  },
  balanceText: {
    fontSize: 14,
    fontFamily: "Roboto Regular",
    color: "gray"
  },
  balancePercent: {
    fontSize: 14,
    fontFamily: "Roboto Regular",
    color: COLORS.green
  },
  dataCardContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: SIZES.width - 32,
    height: 130,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    alignItems: "center",
    flexDirection: "row",
    marginVertical: 22
  },
  tabContainer: {
  },
  btnContainer: {
    height: 29,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: COLORS.gray6,
  },
  btnText: {
    fontSize: 12,
    fontFamily: "Roboto Regular",
    color: COLORS.black,
  },
  reviewContent: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  reviewCard: {

  },
  reviewAmount: {
    fontSize: 20,
    fontFamily: "Roboto Bold",
    color: COLORS.black,
    marginVertical: 4
  },
  reviewName: {
    fontSize: 14,
    fontFamily: "Roboto Regular",
    color: COLORS.black,
  },
  statsCard: {
    height: 340,
    width: SIZES.width - 32,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    marginVertical: 24,
    paddingTop: 16
  }
})
export default Dashboard