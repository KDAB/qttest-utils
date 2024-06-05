// SPDX-FileCopyrightText: 2023 Klarälvdalens Datakonsult AB, a KDAB Group
// company <info@kdab.com> Author: Sergio Martins <sergio.martins@kdab.com>
// SPDX-License-Identifier: MIT

#include <QDebug>
#include <QObject>
#include <QtTest>

class MyTest : public QObject {
  Q_OBJECT
private Q_SLOTS:
  void testA() {
    QBENCHMARK { int a = 1; }
  }
  void testB() {}
  void testC() { qDebug() << "MyTest::testC()"; }
  void testXFAIL() {
    QEXPECT_FAIL("", "To be fixed", Continue);
    QVERIFY(false);
  }
};

QTEST_MAIN(MyTest);

#include <test1.moc>
