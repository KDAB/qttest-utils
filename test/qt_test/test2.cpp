// SPDX-FileCopyrightText: 2023 Klarälvdalens Datakonsult AB, a KDAB Group
// company <info@kdab.com> Author: Sergio Martins <sergio.martins@kdab.com>
// SPDX-License-Identifier: MIT

#include <QObject>
#include <QtTest>

class MyTest : public QObject {
  Q_OBJECT
private Q_SLOTS:
  void testD() {}
  void testE() {}
  void testF() { QFAIL("failed"); }
  void testXPASS() {
    QEXPECT_FAIL("", "To be fixed", Continue);
    QVERIFY(true);
  }
  void testMixXFAILWithFAIL() {
    QEXPECT_FAIL("", "To be fixed", Continue);
    QVERIFY(false);
    QVERIFY(false);
  }
};

QTEST_MAIN(MyTest);

#include <test2.moc>
